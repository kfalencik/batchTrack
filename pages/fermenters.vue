<template>
  <div class="fermenters-page">
    <PageHeader 
        title="Fermenters"
        description="Manage your fermentation vessels. Track capacity, assign unique IDs, and monitor which fermenters are currently in use."
        action-text="Add Fermenter"
        action-icon="mdi-plus-circle"
        @action="openAdd"
    />

    <LoadingWrapper :loading="loading" text="Loading fermenters...">
        <div class="data-table-wrapper">
            <v-data-table
                class="modern-data-table"
                :headers="headers"
                :items="fermenters"
                :loading="loading"
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
        <DataTableActions 
            :item="item"
            @edit="openEdit"
            @delete="remove"
        />
      </template>
    </v-data-table>
        </div>
    </LoadingWrapper>

    <BaseDialog
        v-model="editDialog"
        :title="isAdding ? 'Add Fermenter' : 'Edit Fermenter'"
        max-width="800px"
        @close="closeEdit"
    >
        <v-container v-if="edited">
            <v-row>
                <v-col cols="6">
                    <FormField
                        v-model="edited.id"
                        label="ID"
                        type="text"
                        placeholder="Unique identifier (e.g. 1, F1)"
                        prepend-icon="mdi-identifier"
                    />
                </v-col>
                <v-col cols="6">
                    <FormField
                        v-model="edited.size"
                        label="Size (L)"
                        type="number"
                        placeholder="Liters (e.g. 20)"
                        prepend-icon="mdi-cup-water"
                    />
                </v-col>
                <v-col cols="6">
                    <FormField
                        v-model="edited.name"
                        label="Nickname"
                        type="text"
                        placeholder="Optional name"
                        prepend-icon="mdi-tag"
                    />
                </v-col>
                <v-col cols="12">
                    <FormField
                        v-model="edited.notes"
                        label="Notes"
                        type="textarea"
                        placeholder="Optional notes"
                        prepend-icon="mdi-note-text"
                    />
                </v-col>
            </v-row>
        </v-container>

        <template #actions>
            <v-spacer />
            <v-btn text @click="closeEdit">Cancel</v-btn>
            <v-btn color="primary" @click="save">Save</v-btn>
        </template>
    </BaseDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const headers = ref([
  { title: 'ID', value: 'id', sortable: true, width: '100px' },
  { title: 'Nickname', value: 'name', sortable: true },
  { title: 'Size (L)', value: 'size', sortable: true, align: 'center', width: '120px' },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '100px' }
]);

const dataStore = useDataStore();
const loading = ref(false);

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

<style scoped>
/* Modern page layout styles */
.fermenters-page {
    padding: 0 1rem;
    max-width: 1400px;
    margin: 0 auto;
}

.data-table-wrapper {
    background: white;
    border-radius: 1rem;
    border: 1px solid rgb(226 232 240 / 0.8);
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    overflow: hidden;
    backdrop-filter: blur(8px);
}

.modern-data-table {
    background: transparent !important;
}

.modern-data-table :deep(.v-data-table__wrapper) {
    border-radius: 1rem;
}

.modern-data-table :deep(.v-data-table-header) {
    background: rgb(248 250 252);
    border-bottom: 1px solid rgb(226 232 240 / 0.5);
}

.modern-data-table :deep(.v-data-table-header .v-data-table__th) {
    font-weight: 600;
    color: rgb(71 85 105);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.75rem;
    padding: 1rem;
}

.modern-data-table :deep(.v-data-table__tr) {
    border-bottom: 1px solid rgb(226 232 240 / 0.3);
    transition: all 0.2s ease;
}

.modern-data-table :deep(.v-data-table__tr:hover) {
    background: rgb(248 250 252 / 0.5);
}

.modern-data-table :deep(.v-data-table__td) {
    padding: 1rem;
    vertical-align: middle;
}
</style>
