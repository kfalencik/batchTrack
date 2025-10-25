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
            <!-- Help Section -->
            <v-row>
                <v-col cols="12">
                    <v-card variant="flat" class="help-card mb-6">
                        <v-card-title class="help-card-title">
                            <v-icon class="help-icon">mdi-lightbulb-on</v-icon>
                            <span>Fermenter Setup Guidelines</span>
                            <v-spacer />
                            <v-btn
                                variant="text"
                                size="small"
                                @click="showHelp = !showHelp"
                                :color="showHelp ? 'white' : 'rgba(255,255,255,0.7)'"
                            >
                                {{ showHelp ? 'Hide' : 'Show' }} Help
                                <v-icon :class="{ 'rotate-180': showHelp }">mdi-chevron-down</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-expand-transition>
                            <v-card-text v-show="showHelp" class="help-card-content">
                                <div class="help-grid">
                                    <div class="help-item">
                                        <div class="help-item-header">
                                            <v-avatar size="40" class="help-avatar">
                                                <v-icon color="white">mdi-identifier</v-icon>
                                            </v-avatar>
                                            <h4>Fermenter ID</h4>
                                        </div>
                                        <p>Unique identifier for tracking and organization. Use simple codes like "1", "F1", "Tank-A".</p>
                                    </div>
                                    
                                    <div class="help-item">
                                        <div class="help-item-header">
                                            <v-avatar size="40" class="help-avatar">
                                                <v-icon color="white">mdi-water</v-icon>
                                            </v-avatar>
                                            <h4>Capacity Planning</h4>
                                        </div>
                                        <p>Set the maximum brewing capacity to prevent overfilling and help with batch planning. Leave some headspace for fermentation activity.</p>
                                    </div>
                                    
                                    <div class="help-item">
                                        <div class="help-item-header">
                                            <v-avatar size="40" class="help-avatar">
                                                <v-icon color="white">mdi-tag</v-icon>
                                            </v-avatar>
                                            <h4>Organization</h4>
                                        </div>
                                        <p>Use nicknames and notes to distinguish between similar fermenters and track important details like maintenance schedules.</p>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-expand-transition>
                    </v-card>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12">
                    <FormField
                        v-model="edited.id"
                        label="Fermenter ID"
                        type="text"
                        :required="true"
                        placeholder="e.g. 1, F1, Tank-A"
                        hint="Unique identifier for this fermenter"
                        prepend-icon="mdi-identifier"
                    />
                </v-col>
                <v-col cols="12">
                    <FormField
                        v-model="edited.capacity"
                        label="Capacity (L)"
                        type="number"
                        :required="true"
                        placeholder="e.g. 25"
                        hint="Maximum brewing volume in litres"
                        prepend-icon="mdi-water"
                    />
                </v-col>
                <v-col cols="12">
                    <FormField
                        v-model="edited.name"
                        label="Nickname"
                        type="text"
                        placeholder="e.g. Big Blue, Workshop Tank..."
                        hint="Optional friendly name for easy identification"
                        prepend-icon="mdi-tag"
                    />
                </v-col>
                <v-col cols="12">
                    <FormField
                        v-model="edited.notes"
                        label="Notes"
                        type="textarea"
                        placeholder="Equipment details, cleaning schedule, special features..."
                        hint="Optional notes and maintenance reminders"
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
const showHelp = ref(false);

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
    border-radius: 1.5rem;
    border: 1px solid rgb(226 232 240 / 0.6);
    box-shadow: 
        0 4px 6px -1px rgb(0 0 0 / 0.1), 
        0 2px 4px -2px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(255 255 255 / 0.05);
    overflow: hidden;
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 2rem 0;
}

.data-table-wrapper:hover {
    box-shadow: 
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(99 102 241 / 0.1);
    border-color: rgb(99 102 241 / 0.2);
}

.modern-data-table {
    background: transparent !important;
}

.modern-data-table :deep(.v-data-table__wrapper) {
    border-radius: 1.5rem;
}

.modern-data-table :deep(.v-data-table-header) {
    background: linear-gradient(135deg, rgb(248 250 252) 0%, rgb(241 245 249) 100%);
    border-bottom: 2px solid rgb(226 232 240 / 0.6);
}

/* Help section styling */
.help-card {
    background: linear-gradient(135deg, rgb(99 102 241) 0%, rgb(139 92 246) 100%);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
}

.help-card-title {
    color: white;
    padding: 1.5rem 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.help-icon {
    font-size: 1.5rem;
    color: rgb(255 255 255 / 0.9);
}

.help-card-content {
    background: white;
    padding: 2rem;
}

.help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.help-item {
    background: rgb(248 250 252);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgb(226 232 240);
    transition: all 0.3s ease;
}

.help-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: rgb(99 102 241);
}

.help-item-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.help-avatar {
    background: linear-gradient(135deg, rgb(99 102 241), rgb(139 92 246));
    flex-shrink: 0;
}

.help-item h4 {
    color: rgb(30 41 59);
    font-weight: 600;
    margin: 0;
    font-size: 1.1rem;
}

.help-item p {
    color: rgb(71 85 105);
    margin: 0;
    line-height: 1.6;
    font-size: 0.95rem;
}

.rotate-180 {
    transform: rotate(180deg);
    transition: transform 0.3s ease;
}

.modern-data-table :deep(.v-data-table-header .v-data-table__th) {
    font-weight: 700;
    color: rgb(51 65 85);
    text-transform: uppercase;
    letter-spacing: 0.075em;
    font-size: 0.8rem;
    padding: 1.5rem 1.25rem;
    border-bottom: none;
    position: relative;
}

.modern-data-table :deep(.v-data-table-header .v-data-table__th:first-child) {
    padding-left: 2rem;
}

.modern-data-table :deep(.v-data-table-header .v-data-table__th:last-child) {
    padding-right: 2rem;
}

.modern-data-table :deep(.v-data-table__tr) {
    border-bottom: 1px solid rgb(226 232 240 / 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-data-table :deep(.v-data-table__tr:nth-child(even)) {
    background: rgb(248 250 252 / 0.4);
}

.modern-data-table :deep(.v-data-table__tr:hover) {
    background: linear-gradient(135deg, rgb(99 102 241 / 0.08) 0%, rgb(79 70 229 / 0.05) 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
}

.modern-data-table :deep(.v-data-table__td) {
    padding: 1.5rem 1.25rem;
    vertical-align: middle;
    font-weight: 500;
    color: rgb(15 23 42);
    border-bottom: none;
}

.modern-data-table :deep(.v-data-table__td:first-child) {
    padding-left: 2rem;
}

.modern-data-table :deep(.v-data-table__td:last-child) {
    padding-right: 2rem;
}

/* Mobile responsiveness for tables */
@media (max-width: 768px) {
    .fermenters-page {
        padding: 0 0.5rem;
    }
    
    .data-table-wrapper {
        border-radius: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
    }
    
    .modern-data-table :deep(.v-data-table-header .v-data-table__th) {
        padding: 1rem 0.75rem;
        font-size: 0.7rem;
    }
    
    .modern-data-table :deep(.v-data-table-header .v-data-table__th:first-child) {
        padding-left: 1rem;
    }
    
    .modern-data-table :deep(.v-data-table-header .v-data-table__th:last-child) {
        padding-right: 1rem;
    }
    
    .modern-data-table :deep(.v-data-table__td) {
        padding: 1rem 0.75rem;
    }
    
    .modern-data-table :deep(.v-data-table__td:first-child) {
        padding-left: 1rem;
    }
    
    .modern-data-table :deep(.v-data-table__td:last-child) {
        padding-right: 1rem;
    }
    
    .modern-data-table :deep(.v-data-table__tr:hover) {
        transform: none;
        box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0.1);
    }
}

/* Extra small devices */
@media (max-width: 480px) {
    .modern-data-table :deep(.v-data-table-header .v-data-table__th) {
        padding: 0.75rem 0.5rem;
        font-size: 0.65rem;
    }
    
    .modern-data-table :deep(.v-data-table__td) {
        padding: 0.75rem 0.5rem;
        font-size: 0.875rem;
    }
}
</style>
