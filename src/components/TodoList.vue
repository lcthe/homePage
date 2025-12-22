<template>
  <div class="todo-list">
    <div class="todo-header">
      <Icon size="20">
        <Tasks />
      </Icon>
      <span class="title">任务列表</span>
    </div>
    <div class="todo-content">
      <!-- 添加任务 -->
      <div class="add-task">
        <input
          v-model="newTask"
          @keyup.enter="addTask"
          placeholder="添加新任务..."
          class="task-input"
        />
        <input
          v-model="newTaskDate"
          type="date"
          class="date-input"
          :min="today"
        />
        <button @click="addTask" class="add-btn">
          <Icon size="18">
            <Plus />
          </Icon>
        </button>
      </div>
      <!-- 任务列表 -->
      <div class="tasks-wrapper">
        <!-- 未完成任务 -->
        <div v-if="incompleteTasks.length > 0" class="task-section">
          <div class="section-header">
            <span class="section-title">待办任务</span>
            <span class="section-count">{{ incompleteTasks.length }}</span>
          </div>
          <transition-group name="list" tag="div" class="task-list">
            <div
              v-for="task in sortedIncompleteTasks"
              :key="task.id"
              class="task-wrapper"
            >
              <div
                class="task-item"
                :class="{ completed: task.completed, overdue: isOverdue(task) }"
              >
                <button 
                  v-if="task.subTasks && task.subTasks.length > 0"
                  class="expand-btn" 
                  @click="toggleExpand(task.id)"
                >
                  <Icon size="14">
                    <component :is="expandedTasks[task.id] ? Down : Right" />
                  </Icon>
                </button>
                <div class="task-checkbox" @click="toggleTask(task.id)">
                  <Icon v-if="task.completed" size="16">
                    <Check />
                  </Icon>
                </div>
                <div class="task-content">
                  <span class="task-text" @click="toggleTask(task.id)">{{ task.text }}</span>
                  <div class="task-meta">
                    <span v-if="task.dueDate" class="due-date" :class="{ overdue: isOverdue(task) }">
                      <Icon size="14">
                        <Calendar />
                      </Icon>
                      {{ formatDate(task.dueDate) }}
                      <span v-if="!task.completed && isOverdue(task)" class="overdue-tag">已逾期</span>
                      <span v-else-if="!task.completed && isDueToday(task)" class="today-tag">今天到期</span>
                    </span>
                    <span v-if="getSubTaskProgress(task)" class="subtask-progress">
                      {{ getSubTaskProgress(task).completed }}/{{ getSubTaskProgress(task).total }}
                    </span>
                  </div>
                </div>
                <button class="add-subtask-btn" @click="toggleSubTaskInput(task.id)" title="添加子任务">
                  <Icon size="14">
                    <Plus />
                  </Icon>
                </button>
                <button class="delete-btn" @click="deleteTask(task.id)">
                  <Icon size="16">
                    <Close />
                  </Icon>
                </button>
              </div>
              
              <!-- 子任务输入框 -->
              <div v-if="showSubTaskInput[task.id]" class="subtask-input">
                <input
                  v-model="newSubTask[task.id]"
                  @keyup.enter="addSubTask(task.id)"
                  placeholder="添加子任务..."
                  class="subtask-input-field"
                />
                <button @click="addSubTask(task.id)" class="subtask-add-btn">
                  <Icon size="14">
                    <Check />
                  </Icon>
                </button>
              </div>
              
              <!-- 子任务列表 -->
              <transition name="expand">
                <div v-if="expandedTasks[task.id] && task.subTasks && task.subTasks.length > 0" class="subtasks">
                  <div
                    v-for="subTask in task.subTasks"
                    :key="subTask.id"
                    class="subtask-item"
                    :class="{ completed: subTask.completed }"
                  >
                    <div class="subtask-checkbox" @click="toggleSubTask(task.id, subTask.id)">
                      <Icon v-if="subTask.completed" size="12">
                        <Check />
                      </Icon>
                    </div>
                    <span class="subtask-text" @click="toggleSubTask(task.id, subTask.id)">
                      {{ subTask.text }}
                    </span>
                    <button class="subtask-delete-btn" @click="deleteSubTask(task.id, subTask.id)">
                      <Icon size="12">
                        <Close />
                      </Icon>
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </transition-group>
        </div>

        <!-- 已完成任务 -->
        <div v-if="completedTasks.length > 0" class="task-section completed-section">
          <div class="section-header clickable" @click="showCompletedTasks = !showCompletedTasks">
            <Icon size="16">
              <component :is="showCompletedTasks ? Down : Right" />
            </Icon>
            <span class="section-title">已完成</span>
            <span class="section-count">{{ completedTasks.length }}</span>
          </div>
          <transition name="expand">
            <transition-group v-if="showCompletedTasks" name="list" tag="div" class="task-list">
              <div
                v-for="task in sortedCompletedTasks"
                :key="task.id"
                class="task-wrapper"
              >
                <div class="task-item completed">
                  <button 
                    v-if="task.subTasks && task.subTasks.length > 0"
                    class="expand-btn" 
                    @click="toggleExpand(task.id)"
                  >
                    <Icon size="14">
                      <component :is="expandedTasks[task.id] ? Down : Right" />
                    </Icon>
                  </button>
                  <div class="task-checkbox" @click="toggleTask(task.id)">
                    <Icon v-if="task.completed" size="16">
                      <Check />
                    </Icon>
                  </div>
                  <div class="task-content">
                    <span class="task-text" @click="toggleTask(task.id)">{{ task.text }}</span>
                    <div class="task-meta">
                      <span v-if="getSubTaskProgress(task)" class="subtask-progress">
                        {{ getSubTaskProgress(task).completed }}/{{ getSubTaskProgress(task).total }}
                      </span>
                    </div>
                  </div>
                  <button class="delete-btn" @click="deleteTask(task.id)">
                    <Icon size="16">
                      <Close />
                    </Icon>
                  </button>
                </div>
                
                <!-- 子任务列表 -->
                <transition name="expand">
                  <div v-if="expandedTasks[task.id] && task.subTasks && task.subTasks.length > 0" class="subtasks">
                    <div
                      v-for="subTask in task.subTasks"
                      :key="subTask.id"
                      class="subtask-item completed"
                    >
                      <div class="subtask-checkbox" @click="toggleSubTask(task.id, subTask.id)">
                        <Icon v-if="subTask.completed" size="12">
                          <Check />
                        </Icon>
                      </div>
                      <span class="subtask-text" @click="toggleSubTask(task.id, subTask.id)">
                        {{ subTask.text }}
                      </span>
                      <button class="subtask-delete-btn" @click="deleteSubTask(task.id, subTask.id)">
                        <Icon size="12">
                          <Close />
                        </Icon>
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </transition-group>
          </transition>
        </div>

        <div v-if="tasks.length === 0" class="empty-state">
          暂无任务，添加一个开始吧！
        </div>
      </div>
      <!-- 统计信息 -->
      <div class="todo-footer" v-if="tasks.length > 0">
        <span>共 {{ tasks.length }} 项</span>
        <span>已完成 {{ completedCount }}</span>
        <span v-if="overdueCount > 0" class="overdue-count">逾期 {{ overdueCount }}</span>
        <button v-if="completedCount > 0" @click="clearCompleted" class="clear-btn">
          清除已完成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
import { Tasks, Calendar } from "@vicons/fa";
import { Plus, Check, Close, Down, Right } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import WebDAVClient from "@/utils/webdav.js";
import MinIOClient from "@/utils/minio.js";
import dayjs from "dayjs";

const store = mainStore();

// 初始化存储客户端
const storageType = import.meta.env.VITE_TODO_STORAGE || 'localStorage';
let storageClient = null;

if (storageType === 'webdav') {
  storageClient = new WebDAVClient(
    import.meta.env.VITE_WEBDAV_URL,
    import.meta.env.VITE_WEBDAV_USERNAME,
    import.meta.env.VITE_WEBDAV_PASSWORD
  );
} else if (storageType === 'minio') {
  storageClient = new MinIOClient(
    import.meta.env.VITE_MINIO_ENDPOINT,
    import.meta.env.VITE_MINIO_ACCESS_KEY,
    import.meta.env.VITE_MINIO_SECRET_KEY,
    import.meta.env.VITE_MINIO_BUCKET
  );
}

// 新任务输入
const newTask = ref("");
const newTaskDate = ref("");

// 子任务输入
const newSubTask = ref({});
const showSubTaskInput = ref({});

// 展开状态
const expandedTasks = ref({});
const showCompletedTasks = ref(true);

// 加载状态
const loading = ref(false);

// 今天的日期（用于日期选择器的最小值）
const today = computed(() => {
  return dayjs().format("YYYY-MM-DD");
});

// 任务列表
const tasks = ref([]);

// 未完成任务列表
const incompleteTasks = computed(() => {
  return tasks.value.filter((task) => !task.completed);
});

// 已完成任务列表
const completedTasks = computed(() => {
  return tasks.value.filter((task) => task.completed);
});

// 已完成任务数量
const completedCount = computed(() => {
  return completedTasks.value.length;
});

// 逾期任务数量
const overdueCount = computed(() => {
  return tasks.value.filter((task) => !task.completed && isOverdue(task)).length;
});

// 排序后的未完成任务列表（逾期 > 今天到期 > 未来）
const sortedIncompleteTasks = computed(() => {
  return [...incompleteTasks.value].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    
    // 逾期的排在前面
    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1;
    }
    
    // 按日期升序排列
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
});

// 排序后的已完成任务列表（按完成时间倒序，最近完成的在前）
const sortedCompletedTasks = computed(() => {
  return [...completedTasks.value].sort((a, b) => {
    // 按完成时间倒序排列
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bTime - aTime;
  });
});

// 判断是否逾期
const isOverdue = (task) => {
  if (!task.dueDate || task.completed) return false;
  return dayjs(task.dueDate).isBefore(dayjs(), "day");
};

// 判断是否今天到期
const isDueToday = (task) => {
  if (!task.dueDate || task.completed) return false;
  return dayjs(task.dueDate).isSame(dayjs(), "day");
};

// 格式化日期显示
const formatDate = (date) => {
  const taskDate = dayjs(date);
  const now = dayjs();
  
  if (taskDate.isSame(now, "day")) {
    return "今天";
  } else if (taskDate.isSame(now.add(1, "day"), "day")) {
    return "明天";
  } else if (taskDate.isSame(now.subtract(1, "day"), "day")) {
    return "昨天";
  } else {
    return taskDate.format("MM月DD日");
  }
};

// 添加任务
const addTask = async () => {
  if (newTask.value.trim()) {
    const task = {
      id: Date.now(),
      text: newTask.value.trim(),
      completed: false,
      dueDate: newTaskDate.value || null,
      createdAt: new Date().toISOString(),
      subTasks: [],
    };
    
    tasks.value.push(task);
    newTask.value = "";
    newTaskDate.value = "";
    
    await saveTasks();
  }
};

// 添加子任务
const addSubTask = async (taskId) => {
  const subTaskText = newSubTask.value[taskId];
  if (subTaskText && subTaskText.trim()) {
    const task = tasks.value.find((t) => t.id === taskId);
    if (task) {
      if (!task.subTasks) task.subTasks = [];
      task.subTasks.push({
        id: Date.now(),
        text: subTaskText.trim(),
        completed: false,
      });
      newSubTask.value[taskId] = "";
      showSubTaskInput.value[taskId] = false;
      await saveTasks();
    }
  }
};

// 切换子任务输入框显示
const toggleSubTaskInput = (taskId) => {
  showSubTaskInput.value[taskId] = !showSubTaskInput.value[taskId];
};

// 切换任务展开状态
const toggleExpand = (taskId) => {
  expandedTasks.value[taskId] = !expandedTasks.value[taskId];
};

// 删除子任务
const deleteSubTask = async (taskId, subTaskId) => {
  ElMessageBox.confirm(
    '确定要删除这个子任务吗？',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const task = tasks.value.find((t) => t.id === taskId);
      if (task && task.subTasks) {
        task.subTasks = task.subTasks.filter((st) => st.id !== subTaskId);
        await saveTasks();
        ElMessage.success('子任务已删除');
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 切换子任务状态
const toggleSubTask = async (taskId, subTaskId) => {
  const task = tasks.value.find((t) => t.id === taskId);
  if (task && task.subTasks) {
    const subTask = task.subTasks.find((st) => st.id === subTaskId);
    if (subTask) {
      subTask.completed = !subTask.completed;
      // 检查是否所有子任务都完成，如果是则自动完成主任务
      if (task.subTasks.every((st) => st.completed) && task.subTasks.length > 0) {
        task.completed = true;
        task.completedAt = new Date().toISOString();
      }
      await saveTasks();
    }
  }
};

// 获取子任务完成进度
const getSubTaskProgress = (task) => {
  if (!task.subTasks || task.subTasks.length === 0) return null;
  const completed = task.subTasks.filter((st) => st.completed).length;
  const total = task.subTasks.length;
  return { completed, total };
};

// 切换任务状态
const toggleTask = async (id) => {
  const task = tasks.value.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    // 记录完成时间
    if (task.completed) {
      task.completedAt = new Date().toISOString();
    } else {
      delete task.completedAt;
    }
    await saveTasks();
  }
};

// 删除任务
const deleteTask = async (id) => {
  ElMessageBox.confirm(
    '确定要删除这个任务吗？',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      tasks.value = tasks.value.filter((t) => t.id !== id);
      await saveTasks();
      ElMessage.success('任务已删除');
    })
    .catch(() => {
      // 用户取消删除
    });
};


// 清除已完成任务
const clearCompleted = async () => {
  ElMessageBox.confirm(
    `确定要清除所有已完成的任务吗？（共 ${completedCount.value} 项）`,
    '清除确认',
    {
      confirmButtonText: '清除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      tasks.value = tasks.value.filter((t) => !t.completed);
      await saveTasks();
      ElMessage.success('已完成任务已清除');
    })
    .catch(() => {
      // 用户取消清除
    });
};

// 保存任务
const saveTasks = async () => {
  loading.value = true;
  try {
    if ((storageType === 'webdav' || storageType === 'minio') && storageClient) {
      // 使用 WebDAV 或 MinIO 保存
      await storageClient.saveTasks(tasks.value);
    } else {
      // 使用 localStorage 保存
      localStorage.setItem("todoTasks", JSON.stringify(tasks.value));
    }
  } catch (error) {
    console.error('保存任务失败:', error);
    ElMessage.error('保存任务失败，已保存到本地浏览器');
  } finally {
    loading.value = false;
  }
};

// 加载任务
const loadTasks = async () => {
  loading.value = true;
  try {
    if ((storageType === 'webdav' || storageType === 'minio') && storageClient) {
      // 从 WebDAV 或 MinIO 加载
      tasks.value = await storageClient.readTasks();
    } else {
      // 从 localStorage 加载
      const saved = localStorage.getItem("todoTasks");
      tasks.value = saved ? JSON.parse(saved) : [];
    }
  } catch (error) {
    console.error('加载任务失败:', error);
    ElMessage.error('加载任务失败，尝试从本地恢复');
    // 尝试从本地恢复
    const saved = localStorage.getItem("todoTasks");
    tasks.value = saved ? JSON.parse(saved) : [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTasks();
});
</script>

<style lang="scss" scoped>
.todo-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  animation: fade 0.5s;

  .todo-header {
    margin: 2rem 0.25rem 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }

  .todo-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .add-task {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      .task-input {
        flex: 1;
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: #fff;
        font-size: 0.95rem;
        outline: none;
        transition: all 0.3s;

        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        &:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
        }
      }

      .date-input {
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: #fff;
        font-size: 0.9rem;
        outline: none;
        transition: all 0.3s;
        min-width: 140px;

        &::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        &:focus {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
        }
      }

      .add-btn {
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }

    .tasks-wrapper {
      max-height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-right: 0.5rem;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }

      .task-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          user-select: none;

          &.clickable {
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              color: rgba(255, 255, 255, 1);
            }
          }

          .section-title {
            flex: 1;
          }

          .section-count {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.1);
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
          }
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        &.completed-section {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      }

      .task-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .task-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        &.completed {
          opacity: 0.6;

          .task-text {
            text-decoration: line-through;
            color: rgba(255, 255, 255, 0.6);
          }
        }

        &.overdue:not(.completed) {
          border-left: 3px solid #ff6b6b;
        }

        .expand-btn {
          padding: 0.25rem;
          margin-top: 2px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          flex-shrink: 0;

          &:hover {
            color: rgba(255, 255, 255, 1);
            transform: scale(1.1);
          }

          &:active {
            transform: scale(0.9);
          }
        }

        .task-checkbox {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          flex-shrink: 0;

          &:hover {
            border-color: rgba(255, 255, 255, 0.8);
            background: rgba(255, 255, 255, 0.1);
          }
        }

        .completed .task-checkbox {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.8);
        }

        .task-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          .task-text {
            color: #fff;
            font-size: 0.95rem;
            cursor: pointer;
            word-break: break-word;
            line-height: 1.4;
          }

          .task-meta {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .due-date {
              display: flex;
              align-items: center;
              gap: 0.3rem;
              font-size: 0.8rem;
              color: rgba(255, 255, 255, 0.6);
              padding: 0.2rem 0.5rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 4px;

              &.overdue {
                color: #ff6b6b;
                background: rgba(255, 107, 107, 0.2);
              }

              .overdue-tag,
              .today-tag {
                font-size: 0.75rem;
                padding: 0.1rem 0.4rem;
                border-radius: 3px;
                margin-left: 0.2rem;
              }

              .overdue-tag {
                background: rgba(255, 107, 107, 0.3);
                color: #fff;
              }

              .today-tag {
                background: rgba(255, 193, 7, 0.3);
                color: #fff;
              }
            }

            .subtask-progress {
              font-size: 0.75rem;
              color: rgba(255, 255, 255, 0.6);
              padding: 0.2rem 0.5rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 4px;
            }
          }
        }

        .add-subtask-btn {
          padding: 0.25rem;
          margin-top: 2px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          flex-shrink: 0;

          &:hover {
            color: rgba(76, 175, 80, 0.8);
            transform: scale(1.1);
          }

          &:active {
            transform: scale(0.9);
          }
        }

        .delete-btn {
          padding: 0.25rem;
          margin-top: 2px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          flex-shrink: 0;

          &:hover {
            color: #ff6b6b;
            transform: scale(1.1);
          }

          &:active {
            transform: scale(0.9);
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.95rem;
      }

      .subtask-input {
        display: flex;
        gap: 0.5rem;
        padding-left: 3rem;
        animation: fade 0.3s;

        .subtask-input-field {
          flex: 1;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          color: #fff;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.3s;

          &::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          &:focus {
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(255, 255, 255, 0.3);
          }
        }

        .subtask-add-btn {
          padding: 0.5rem;
          background: rgba(76, 175, 80, 0.2);
          border: none;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;

          &:hover {
            background: rgba(76, 175, 80, 0.3);
          }

          &:active {
            transform: scale(0.95);
          }
        }
      }

      .subtasks {
        padding-left: 3rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .subtask-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          transition: all 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.08);
          }

          &.completed {
            opacity: 0.6;

            .subtask-text {
              text-decoration: line-through;
              color: rgba(255, 255, 255, 0.5);
            }
          }

          .subtask-checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            flex-shrink: 0;

            &:hover {
              border-color: rgba(255, 255, 255, 0.7);
              background: rgba(255, 255, 255, 0.08);
            }
          }

          &.completed .subtask-checkbox {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.7);
          }

          .subtask-text {
            flex: 1;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.85rem;
            cursor: pointer;
            word-break: break-word;
            line-height: 1.3;
          }

          .subtask-delete-btn {
            padding: 0.2rem;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            flex-shrink: 0;

            &:hover {
              color: #ff6b6b;
              transform: scale(1.1);
            }

            &:active {
              transform: scale(0.9);
            }
          }
        }
      }
    }

    .todo-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      flex-wrap: wrap;

      .overdue-count {
        color: #ff6b6b;
        font-weight: 500;
      }

      .clear-btn {
        padding: 0.4rem 0.8rem;
        background: rgba(255, 107, 107, 0.2);
        border: none;
        border-radius: 6px;
        color: #fff;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 107, 107, 0.3);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

// 列表动画
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// 展开动画
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

// 移动端适配
@media (max-width: 720px) {
  .todo-list {
    .todo-content {
      .add-task {
        flex-wrap: wrap;

        .task-input {
          width: 100%;
        }

        .date-input {
          flex: 1;
        }
      }
    }
  }
}
</style>
