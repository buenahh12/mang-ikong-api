import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryFailedError, Repository } from 'typeorm';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { MenuItemQueryDto } from './dto/menu-item-query.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItem } from './entities/menu-item.entity';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,
  ) {}

  findAll(query: MenuItemQueryDto): Promise<MenuItem[]> {
    const where: FindOptionsWhere<MenuItem> = {};
    if (query.category) where.category = query.category;
    if (query.available !== undefined) where.isAvailable = query.available;

    return this.menuItemsRepository.find({
      where,
      order: { category: 'ASC', itemName: 'ASC' },
    });
  }

  async findOne(itemId: number): Promise<MenuItem> {
    const item = await this.menuItemsRepository.findOne({ where: { itemId } });
    if (!item) {
      throw new NotFoundException(`Menu item #${itemId} not found`);
    }
    return item;
  }

  create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const item = this.menuItemsRepository.create(dto);
    return this.menuItemsRepository.save(item);
  }

  async update(itemId: number, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.findOne(itemId);
    Object.assign(item, dto);
    return this.menuItemsRepository.save(item);
  }

  async setAvailability(
    itemId: number,
    isAvailable: boolean,
  ): Promise<MenuItem> {
    const item = await this.findOne(itemId);
    item.isAvailable = isAvailable;
    return this.menuItemsRepository.save(item);
  }

  async remove(itemId: number): Promise<{ message: string }> {
    const item = await this.findOne(itemId);
    try {
      await this.menuItemsRepository.remove(item);
    } catch (error) {
      // The order_items foreign key (ON DELETE RESTRICT) blocks deleting
      // a dish that is part of an existing order
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code ===
          'ER_ROW_IS_REFERENCED_2'
      ) {
        throw new ConflictException(
          'This item is part of existing orders and cannot be deleted. Mark it unavailable instead.',
        );
      }
      throw error;
    }
    return { message: `Menu item #${itemId} deleted` };
  }
}
