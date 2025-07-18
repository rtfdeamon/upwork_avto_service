import fs from 'fs';
import path from 'path';

const dirPath = path.resolve(__dirname, '../apps/api/src/entities');
const filePath = path.join(dirPath, 'api-key.entity.ts');

const content = `
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  key: string;

  @Column({ default: true })
  isActive: boolean;
}
`.trim();

fs.mkdirSync(dirPath, { recursive: true });
fs.writeFileSync(filePath, content, { encoding: 'utf-8' });

console.log('✅ Файл создан:', filePath);
