/**
 * MinIO 对象存储工具类
 * 用于通过 MinIO S3 API 读写任务数据
 */

class MinIOClient {
  constructor(endpoint, accessKey, secretKey, bucket) {
    this.endpoint = endpoint.replace(/\/$/, ''); // 移除末尾斜杠
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.bucket = bucket;
    this.objectKey = 'todo-tasks.json'; // 对象键名
  }

  /**
   * 生成 AWS Signature V4 签名
   */
  async generateSignature(method, date, contentHash = '') {
    const dateStamp = date.toISOString().split('T')[0].replace(/-/g, '');
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const region = 'us-east-1'; // MinIO 默认区域
    const service = 's3';
    
    const canonicalUri = `/${this.bucket}/${this.objectKey}`;
    const canonicalQueryString = '';
    const canonicalHeaders = `host:${this.endpoint.replace(/^https?:\/\//, '')}\nx-amz-content-sha256:${contentHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${contentHash}`;
    
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${await this.sha256(canonicalRequest)}`;
    
    const signingKey = await this.getSignatureKey(this.secretKey, dateStamp, region, service);
    const signature = await this.hmacSha256(signingKey, stringToSign);
    
    return {
      authorization: `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      amzDate,
      contentHash
    };
  }

  /**
   * SHA256 哈希
   */
  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * HMAC SHA256
   */
  async hmacSha256(key, message) {
    const keyBuffer = typeof key === 'string' ? new TextEncoder().encode(key) : key;
    const msgBuffer = new TextEncoder().encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
    const signatureArray = Array.from(new Uint8Array(signature));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 获取签名密钥
   */
  async getSignatureKey(key, dateStamp, region, service) {
    const kDate = await this.hmacSha256Raw('AWS4' + key, dateStamp);
    const kRegion = await this.hmacSha256Raw(kDate, region);
    const kService = await this.hmacSha256Raw(kRegion, service);
    const kSigning = await this.hmacSha256Raw(kService, 'aws4_request');
    return kSigning;
  }

  /**
   * HMAC SHA256 返回原始字节
   */
  async hmacSha256Raw(key, message) {
    const keyBuffer = typeof key === 'string' ? new TextEncoder().encode(key) : key;
    const msgBuffer = new TextEncoder().encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    return await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  }

  /**
   * 读取任务数据
   */
  async readTasks() {
    try {
      const url = `${this.endpoint}/${this.bucket}/${this.objectKey}`;
      
      // 如果 bucket 是公开的，直接请求，不需要签名
      // 添加时间戳防止缓存
      const response = await fetch(url + '?t=' + Date.now(), {
        method: 'GET',
        cache: 'no-cache',
      });

      if (response.status === 404) {
        console.log('任务文件不存在，将创建新文件');
        return [];
      }

      if (!response.ok) {
        throw new Error(`读取失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('从 MinIO 加载任务成功，任务数量:', data.length);
      return data || [];
    } catch (error) {
      console.error('读取任务失败:', error);
      throw error;
    }
  }

  /**
   * 保存任务数据
   */
  async saveTasks(tasks) {
    try {
      const content = JSON.stringify(tasks, null, 2);
      const url = `${this.endpoint}/${this.bucket}/${this.objectKey}`;
      
      console.log('正在保存任务到 MinIO，任务数量:', tasks.length);
      
      // 如果 bucket 是公开的，直接请求，不需要签名
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: content,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('保存失败响应:', errorText);
        throw new Error(`保存失败: ${response.status} ${response.statusText}`);
      }

      console.log('保存任务到 MinIO 成功');
      return true;
    } catch (error) {
      console.error('保存任务失败:', error);
      throw error;
    }
  }

  /**
   * 检查连接是否正常
   */
  async checkConnection() {
    try {
      const date = new Date();
      const emptyHash = await this.sha256('');
      const { authorization, amzDate, contentHash } = await this.generateSignature('HEAD', date, emptyHash);
      
      const url = `${this.endpoint}/${this.bucket}`;
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Authorization': authorization,
          'x-amz-content-sha256': contentHash,
          'x-amz-date': amzDate,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('连接检查失败:', error);
      return false;
    }
  }
}

export default MinIOClient;
