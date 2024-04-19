import { createUser } from '~/services/user.server';

export async function seedUsers() {
  await createUser('test@example.com', 'test');
  await createUser('test2@example.com', 'test');
}
