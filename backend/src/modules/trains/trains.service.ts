import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';

@Injectable()
export class TrainsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrainDto: CreateTrainDto) {
    return this.prisma.train.create({
      data: createTrainDto,
    });
  }

  async findAll() {
    return this.prisma.train.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.train.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateTrainDto: UpdateTrainDto) {
    return this.prisma.train.update({
      where: { id },
      data: updateTrainDto,
    });
  }

  async remove(id: string) {
    return this.prisma.train.delete({
      where: { id },
    });
  }
}
