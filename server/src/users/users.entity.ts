import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  ID!: number;

  @Column({ unique: true })
  Email!: string;

  @Column({ unique: true })
  PhoneNumber!: string;

  @Column({ unique: true })
  Username!: string;

  @Column()
  Password!: string;
}