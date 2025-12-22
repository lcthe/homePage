/**
 * WebDAV 工具类
 * 用于通过 AList 的 WebDAV 接口读写任务数据
 */

class WebDAVClient {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
    this.auth = 'Basic ' + btoa(`${username}:${password}`);
    this.filePath = '/data/todo-data/todo-tasks.json'; // 任务文件路径
  }

  /**
   * 读取任务数据
   */
  async readTasks() {
    try {
      const url = `${this.baseUrl}${this.filePath}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.auth,
        },
      });

      if (response.status === 404) {
        // 文件不存在，返回空数组
        console.log('任务文件不存在，将创建新文件');
        return [];
      }

      if (!response.ok) {
        throw new Error(`读取失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('从 WebDAV 加载任务成功');
      return data || [];
    } catch (error) {
      console.error('读取任务失败:', error);
      // 如果读取失败，尝试从本地存储恢复
      const localData = localStorage.getItem('todoTasks');
      if (localData) {
        console.log('从本地存储恢复任务');
        return JSON.parse(localData);
      }
      return [];
    }
  }

  /**
   * 保存任务数据
   */
  async saveTasks(tasks) {
    try {
      const url = `${this.baseUrl}${this.filePath}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': this.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tasks, null, 2),
      });

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status} ${response.statusText}`);
      }

      // 同时保存到本地作为备份
      localStorage.setItem('todoTasks', JSON.stringify(tasks));
      console.log('保存任务到 WebDAV 成功');
      return true;
    } catch (error) {
      console.error('保存任务失败:', error);
      // 保存失败时至少保存到本地
      localStorage.setItem('todoTasks', JSON.stringify(tasks));
      console.log('已保存到本地存储作为备份');
      throw error;
    }
  }

  /**
   * 检查连接是否正常
   */
  async checkConnection() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PROPFIND',
        headers: {
          'Authorization': this.auth,
          'Depth': '0',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('连接检查失败:', error);
      return false;
    }
  }
}

export default WebDAVClient;
