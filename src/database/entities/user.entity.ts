import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users') // Название таблицы в базе данных
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  password: string;
}
