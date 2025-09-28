import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    // 初始化Redis连接
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      db: this.configService.get('REDIS_DB'),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        return Math.min(times * 10, 2000); // 重试策略：每次重试间隔时间递增，但不超过2秒
      },
    });

    // 监听连接事件
    this.redis.on('connect', () => {
      this.isConnected = true;
    });

    // 监听错误事件
    this.redis.on('error', (error) => {
      this.isConnected = false;
      console.error('Redis连接错误:', error);
    });
  }

  // 模块初始化时连接Redis
  async onModuleInit() {
    // Redis连接是异步的，但ioredis会自动处理重连
  }

  // 模块销毁时关闭Redis连接
  async onModuleDestroy() {
    if (this.isConnected) {
      await this.redis.quit();
    }
  }

  /**
   * 获取Redis实例
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * 获取键值
   * @param key 键名
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * 设置键值
   * @param key 键名
   * @param value 键值
   * @param expire 过期时间（秒）
   */
  async set(key: string, value: string | number, expire?: number): Promise<void> {
    try {
      if (expire) {
        await this.redis.set(key, value, 'EX', expire);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  /**
   * 删除键
   * @param key 键名
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
      throw error;
    }
  }

  /**
   * 设置过期时间
   * @param key 键名
   * @param seconds 过期时间（秒）
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      console.error('Redis expire error:', error);
      throw error;
    }
  }
}