<template>
  <div>
    <div class="d-flex justify-between mb-3">
        <h2 class="mb-5">Fermenters</h2>
      <v-btn color="primary" @click="openAdd">
        <v-icon left>mdi-plus</v-icon>
        Add Fermenter
      </v-btn>
    </div>

    <v-data-table
      class="text-sm"
      :headers="headers"
      :items="fermenters"
    >
      <template #item.id="{ item }">
        <span>{{ item && item.id ? `Fermenter #${item.id}` : '-' }}</span>
      </template>
      <template #item.size="{ item }">
        <span>{{ item && item.size ? item.size + ' L' : '-' }}</span>
      </template>
      <template #item.name="{ item }">
        <span>{{ item && item.name ? item.name : '-' }}</span>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon color="info" flat size="x-small" class="mr-2" @click="openEdit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon color="error" flat size="x-small" @click="remove(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-card class="mt-4 pa-3">
      
    </v-card>

    <v-dialog v-model="editDialog" width="800">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>{{ isAdding ? 'Add Fermenter' : 'Edit Fermenter' }}</v-toolbar-title>
          <spacer />
          <v-btn icon @click="closeEdit">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text v-if="edited">
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field label="ID" v-model="edited.id" hint="Unique identifier (e.g. 1, F1)" persistent-hint />
              </v-col>
              <v-col cols="6">
                <v-text-field label="Size (L)" type="number" v-model="edited.size" hint="Liters (e.g. 20)" persistent-hint />
              </v-col>
              <v-col cols="6">
                <v-text-field label="Nickname" v-model="edited.name" hint="Optional name" persistent-hint />
              </v-col>
              <v-col cols="12">
                <v-textarea label="Notes" v-model="edited.notes" hint="Optional notes" persistent-hint />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeEdit">Cancel</v-btn>
          <v-btn color="primary" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const headers = ref([
  { title: 'ID', value: 'id' },
  { title: 'Nickname', value: 'name' },
  { title: 'Size (L)', value: 'size' },
  { title: 'Actions', value: 'actions', align: 'center' }
]);

const dataStore = useDataStore();

const fermenters = computed(() => dataStore.fermenters);

const editDialog = ref(false);
const edited = ref(null);
const isAdding = ref(false);

function openAdd() {
  edited.value = { id: '', size: null, name: '', notes: '' };
  isAdding.value = true;
  editDialog.value = true;
}

function openEdit(item) {
  edited.value = Object.assign({}, item);
  isAdding.value = false;
  editDialog.value = true;
}

function closeEdit() {
  edited.value = null;
  editDialog.value = false;
}

async function save() {
  if (!edited.value) return;
  // coerce size
  if (edited.value.size !== undefined && edited.value.size !== null && edited.value.size !== '') edited.value.size = Number(edited.value.size);

  if (isAdding.value) {
    await dataStore.addFermenter(edited.value);
  } else {
    await dataStore.updateFermenter(edited.value);
  }
  await dataStore.getFermenters();
  closeEdit();
}

async function remove(item) {
  if (!item || item.id === undefined) return;
  await dataStore.removeFermenter(item.id);
  await dataStore.getFermenters();
}

onMounted(async () => {
  await dataStore.getFermenters();
});

definePageMeta({ layout: 'default' });
useHead({ title: 'Fermenters | BatchTrack' });
</script>
