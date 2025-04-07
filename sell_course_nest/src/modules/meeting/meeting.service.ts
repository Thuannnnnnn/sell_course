import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingParticipant } from './entities/meeting-participant.entity';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(MeetingParticipant)
    private readonly participantRepository: Repository<MeetingParticipant>,
  ) {}

  private generateMeetingCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createRoomMeeting(
    createMeetingDto: CreateMeetingDto,
  ): Promise<Meeting> {
    const meetingCode = this.generateMeetingCode();
    const meeting = this.meetingRepository.create({
      ...createMeetingDto,
      meetingCode,
      startTime: new Date(),
      isActive: true,
    });
    return this.meetingRepository.save(meeting);
  }

  async joinRoomMeeting(meetingCode: string, userId: string): Promise<Meeting> {
    const meeting = await this.meetingRepository.findOne({
      where: { meetingCode, isActive: true },
      relations: ['participants'],
    });
  
    if (!meeting) {
      throw new Error('Invalid meeting code or meeting is not active');
    }
  
    const existingParticipant = await this.participantRepository.findOne({
      where: { meetingId: meeting.id, userId },
    });
  
    if (!existingParticipant) {
      const participant = new MeetingParticipant();
      participant.meetingId = meeting.id;
      participant.userId = userId;
      participant.joinTime = new Date();
      await this.participantRepository.save(participant);
    }
  
    return meeting;
  }

  async leaveRoomAlone(meetingId: string, userId: string): Promise<void> {
    const participant = await this.participantRepository.findOne({
      where: { meetingId, userId, isActive: true },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    participant.isActive = false;
    participant.leaveTime = new Date();
    await this.participantRepository.save(participant);
  }

  async leaveAll(meetingId: string, hostId: string): Promise<void> {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId, hostId, isActive: true },
      relations: ['participants'],
    });

    if (!meeting) {
      throw new Error('Meeting not found or you are not the host');
    }

    meeting.isActive = false;
    meeting.endTime = new Date();
    await this.meetingRepository.save(meeting);

    await this.participantRepository.update(
      { meetingId },
      { isActive: false, leaveTime: new Date() },
    );
  }

  async deleteRoomMeeting(meetingId: string, userId: string): Promise<void> {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
      relations: ['participants'],
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    if (meeting.hostId === userId) {
      await this.meetingRepository.remove(meeting);
    } else {
      await this.participantRepository.update(
        { meetingId, userId },
        { isActive: false },
      );
    }
  }

  async getJoinedMeetings(userId: string): Promise<Meeting[]> {
    const participants = await this.participantRepository.find({
      where: { userId },
      relations: ['meeting'],
    });

    const meetings = participants
      .map((participant) => participant.meeting)
      .filter((meeting) => meeting !== null && meeting.isActive); // Chỉ lấy meeting còn hoạt động
    return meetings;
  }

  async getHostedMeetings(userId: string): Promise<Meeting[]> {
    return this.meetingRepository.find({
      where: { hostId: userId, isActive: true }, // Chỉ lấy meeting còn hoạt động
      relations: ['participants'],
    });
  }

  async getParticipantsInMeeting(
    meetingId: string,
  ): Promise<MeetingParticipant[]> {
    const participants = await this.participantRepository.find({
      where: { meetingId, isActive: true },
      relations: ['user'],
    });

    if (!participants.length) {
      throw new Error('No active participants found in this meeting');
    }

    return participants;
  }
}
