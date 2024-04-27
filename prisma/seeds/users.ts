import { createUser } from '~/services/user.server';

export async function seedUsers() {
  await createUser('test@example.com', 'test');
}
