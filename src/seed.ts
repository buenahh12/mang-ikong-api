// Seed script: creates the first admin account and sample menu items.
// Run with:  npm run seed
// Safe to run more than once: it skips anything that already exists.
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { MenuItem } from './menu-items/entities/menu-item.entity';
import { User, UserRole } from './users/entities/user.entity';

const SAMPLE_MENU: Array<
  Pick<MenuItem, 'itemName' | 'price' | 'category'> & { description: string }
> = [
  {
    itemName: 'Chicken Adobo',
    price: 120,
    category: 'Ulam',
    description: 'Chicken braised in soy sauce, vinegar and garlic',
  },
  {
    itemName: 'Pork Sinigang',
    price: 150,
    category: 'Ulam',
    description: 'Sour tamarind soup with pork and vegetables',
  },
  {
    itemName: 'Lechon Kawali',
    price: 160,
    category: 'Ulam',
    description: 'Crispy deep-fried pork belly',
  },
  {
    itemName: 'Pancit Canton',
    price: 110,
    category: 'Noodles',
    description: 'Stir-fried egg noodles with vegetables',
  },
  {
    itemName: 'Plain Rice',
    price: 20,
    category: 'Rice',
    description: 'One cup of steamed rice',
  },
  {
    itemName: 'Garlic Rice',
    price: 30,
    category: 'Rice',
    description: 'One cup of garlic fried rice',
  },
  {
    itemName: 'Halo-Halo',
    price: 90,
    category: 'Dessert',
    description: 'Shaved ice with sweet beans, fruits and leche flan',
  },
  {
    itemName: 'Sago’t Gulaman',
    price: 35,
    category: 'Drinks',
    description: 'Brown sugar drink with tapioca pearls and jelly',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const config = app.get(ConfigService);
  const users = app.get<Repository<User>>(getRepositoryToken(User));
  const menuItems = app.get<Repository<MenuItem>>(getRepositoryToken(MenuItem));

  // 1) Admin account
  // `||` (not a get() default) so an empty line in .env also falls back
  const email = config.get<string>('SEED_ADMIN_EMAIL') || 'admin@mangikong.com';
  const password = config.get<string>('SEED_ADMIN_PASSWORD') || 'Admin@12345';

  if (await users.exists({ where: { email } })) {
    console.log(`Admin ${email} already exists, skipped`);
  } else {
    await users.save(
      users.create({
        fullName: 'Mang Ikong Admin',
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: UserRole.ADMIN,
      }),
    );
    console.log(`Created admin ${email}`);
  }

  // 2) Sample menu (only when the menu is empty)
  if ((await menuItems.count()) > 0) {
    console.log('Menu already has items, skipped sample menu');
  } else {
    await menuItems.save(menuItems.create(SAMPLE_MENU));
    console.log(`Added ${SAMPLE_MENU.length} sample menu items`);
  }

  await app.close();
}

seed().catch((error: unknown) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
