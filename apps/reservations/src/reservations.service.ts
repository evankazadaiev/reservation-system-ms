import { Inject, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { PAYMENTS_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { map } from 'rxjs';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    @Inject(PAYMENTS_SERVICE) private readonly paymentsService: ClientProxy,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: string) {
    try {
      return this.paymentsService
        .send('create_charge', createReservationDto.charge)
        .pipe(
          map((res) => {
            console.log('CHARGE RESULT >>> ', res);
            return this.reservationsRepository.create({
              ...createReservationDto,
              invoiceId: res.id,
              timestamp: new Date(),
              userId,
            });
          }),
        );
    } catch (error) {
      console.log('Error while creating a reservation:', error);
    }
  }

  findAll(userId: string) {
    return this.reservationsRepository.find({ userId });
  }

  findOne(_id: string) {
    return this.reservationsRepository.findOne({ _id });
  }

  update(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.findOneAndUpdate(
      { _id },
      { $set: updateReservationDto },
    );
  }

  remove(_id: string) {
    return this.reservationsRepository.findOneAndDelete({ _id });
  }
}
