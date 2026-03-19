import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(@InjectRepository(Contact) private repo: Repository<Contact>) {}

  create(dto: CreateContactDto) {
    const contact = this.repo.create(dto);
    return this.repo.save(contact);
  }

  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }

  markReplied(id: number) { return this.repo.update(id, { replied: true }); }
}
