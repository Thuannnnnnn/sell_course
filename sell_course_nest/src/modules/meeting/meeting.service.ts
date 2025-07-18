import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingParticipant } from './entities/meeting-participant.entity';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';

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
    createMeetingDto: CreateMeetingDto & { hostId: string },
  ): Promise<Meeting> {
    try {
      const meetingCode = this.generateMeetingCode();
      const meeting = this.meetingRepository.create({
        title: createMeetingDto.title,
        description: createMeetingDto.description,
        hostId: createMeetingDto.hostId, // Gán trực tiếp
        meetingCode,
        startTime: new Date(),
        isActive: true,
        isScheduled: createMeetingDto.isScheduled || false,
        scheduledTime: createMeetingDto.scheduledTime,
        isRecorded: createMeetingDto.isRecorded || false,
      });

      console.log('Creating meeting with data:', meeting); // Debug log

      if (!meeting.hostId) {
        throw new Error('hostId is missing in meeting entity');
      }

      const savedMeeting = await this.meetingRepository.save(meeting);

      console.log('Saved meeting:', savedMeeting); // Debug log

      const hostParticipant = this.participantRepository.create({
        meetingId: savedMeeting.id,
        userId: createMeetingDto.hostId,
        joinTime: new Date(),
        role: 'host',
        isActive: true,
        hasCamera: false,
        hasMicrophone: false,
        isScreenSharing: false,
      });

      console.log('Creating host participant:', hostParticipant); // Debug log

      await this.participantRepository.save(hostParticipant);

      return savedMeeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create meeting: ${error.message}`);
      }
      throw new Error('Failed to create meeting: Unknown error');
    }
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
      const participant = this.participantRepository.create({
        meetingId: meeting.id,
        userId,
        joinTime: new Date(),
        role: 'participant', // Gán vai trò participant
        isActive: true,
      });
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

    return participants
      .map((participant) => participant.meeting)
      .filter((meeting) => meeting && meeting.isActive);
  }

  async getHostedMeetings(userId: string): Promise<Meeting[]> {
    return this.meetingRepository.find({
      where: { hostId: userId, isActive: true },
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

  async updateParticipantStatus(
    updateData: UpdateParticipantStatusDto & { userId: string },
  ): Promise<MeetingParticipant> {
    const { meetingId, userId, hasCamera, hasMicrophone, isScreenSharing } =
      updateData;

    const participant = await this.participantRepository.findOne({
      where: { meetingId, userId, isActive: true },
    });

    if (!participant) {
      throw new Error('Participant not found or not active in this meeting');
    }

    participant.hasCamera = hasCamera;
    participant.hasMicrophone = hasMicrophone;
    participant.isScreenSharing = isScreenSharing;

    return this.participantRepository.save(participant);
  }
}
