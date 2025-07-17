// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { In, Repository } from 'typeorm';
// import { Notify } from './entities/notify.entity';
// import { CreateNotifyDto, UpdateNotifyDto } from './dto/notify.dto';
// import { UserNotify } from '../User_Notify/entities/user_Notify.entity';
// import { User } from '../user/entities/user.entity';
// import { Course } from '../course/entities/course.entity';
// import { WebSocketGateway } from '@nestjs/websockets';
// import { NotifyGateway } from './notify.gateway';

// @WebSocketGateway({ cors: true })
// @Injectable()
// export class NotifyService {
//   constructor(
//     @InjectRepository(Notify)
//     private notifyRepository: Repository<Notify>,
//     @InjectRepository(UserNotify)
//     private userNotifyRepository: Repository<UserNotify>,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     @InjectRepository(Course)
//     private courseRepository: Repository<Course>,
//     private readonly notifyGateway: NotifyGateway,
//   ) {}

//   async getAll(): Promise<Notify[]> {
//     return await this.notifyRepository.find({
//       relations: ['course', 'userNotifies'],
//     });
//   }

//   async getById(id: string): Promise<Notify> {
//     const notify = await this.notifyRepository.findOne({
//       where: { notifyId: id },
//       relations: ['course', 'userNotifies'],
//     });

//     if (!notify) {
//       throw new Error(`Notify with ID ${id} not found`);
//     }

//     return notify;
//   }
//   async create(createNotifyDto: CreateNotifyDto): Promise<Notify> {
//     const { title, message, type, courseIds, userIds } = createNotifyDto;
//     const notify = this.notifyRepository.create({ title, message, type });

//     await this.notifyRepository.save(notify);

//     let userNotifies = [];

//     if (type === 'USER' && userIds && userIds.length > 0) {
//       const users = await this.userRepository.find({
//         where: { user_id: In(userIds) },
//       });
//       if (users.length === 0) throw new Error('Không tìm thấy người dùng nào');
//       userNotifies = users.map((user) =>
//         this.userNotifyRepository.create({ user, notify }),
//       );
//     } else if (type === 'COURSE' && courseIds && courseIds.length > 0) {
//       const users = await this.userRepository
//         .createQueryBuilder('user')
//         .innerJoin('user.coursePurchased', 'cp')
//         .where('cp.courseId IN (:...courseIds)', { courseIds })
//         .distinct(true)
//         .getMany();
//       if (users.length === 0)
//         throw new Error('Không tìm thấy người dùng nào liên quan đến khóa học');
//       userNotifies = users.map((user) =>
//         this.userNotifyRepository.create({ user, notify }),
//       );
//     } else if (type === 'GLOBAL') {
//       const users = await this.userRepository.find();
//       if (users.length === 0) throw new Error('Không tìm thấy người dùng nào');
//       userNotifies = users.map((user) =>
//         this.userNotifyRepository.create({ user, notify }),
//       );
//     } else if (type === 'ADMIN') {
//       const adminUsers = await this.userRepository.find({
//         where: { role: 'ADMIN' },
//       });
//       if (adminUsers.length === 0)
//         throw new Error('Không tìm thấy người dùng ADMIN nào');
//       userNotifies = adminUsers.map((admin) =>
//         this.userNotifyRepository.create({ user: admin, notify }),
//       );
//     }

//     if (userNotifies.length > 0) {
//       await this.userNotifyRepository.save(userNotifies);
//       userNotifies.forEach((userNotify) =>
//         this.notifyGateway.sendNotificationToUser(
//           userNotify.user.user_id,
//           userNotify,
//         ),
//       );
//     }

//     return notify;
//   }

//   async update(id: string, updateNotifyDto: UpdateNotifyDto): Promise<Notify> {
//     const { title, message, type, courseIds, userIds } = updateNotifyDto;

//     const existingNotify = await this.notifyRepository.findOne({
//       where: { notifyId: id },
//       relations: ['userNotifies', 'userNotifies.user'],
//     });

//     if (!existingNotify) {
//       throw new Error('Thông báo không được tìm thấy trong cơ sở dữ liệu');
//     }

//     // Update notify basic info
//     const updatedNotify = await this.notifyRepository.save({
//       notifyId: id,
//       title,
//       message,
//       type,
//     });

//     let newUserIds: string[] = [];

//     // Get list of users who should receive the notification
//     if (type === 'USER' && userIds && userIds.length > 0) {
//       const users = await this.userRepository.find({
//         where: { user_id: In(userIds) },
//       });
//       if (users.length === 0) throw new Error('Không tìm thấy người dùng nào');
//       newUserIds = users.map((user) => user.user_id);
//     } else if (type === 'COURSE' && courseIds && courseIds.length > 0) {
//       const users = await this.userRepository
//         .createQueryBuilder('user')
//         .innerJoin('user.coursePurchased', 'cp')
//         .where('cp.courseId IN (:...courseIds)', { courseIds })
//         .distinct(true)
//         .getMany();
//       if (users.length === 0)
//         throw new Error('Không tìm thấy người dùng nào liên quan đến khóa học');
//       newUserIds = users.map((user) => user.user_id);
//     } else if (type === 'GLOBAL') {
//       const users = await this.userRepository.find();
//       if (users.length === 0) throw new Error('Không tìm thấy người dùng nào');
//       newUserIds = users.map((user) => user.user_id);
//     } else if (type === 'ADMIN') {
//       const adminUsers = await this.userRepository.find({
//         where: { role: 'ADMIN' },
//       });
//       if (adminUsers.length === 0)
//         throw new Error('Không tìm thấy người dùng ADMIN nào');
//       newUserIds = adminUsers.map((admin) => admin.user_id);
//     }

//     // Get current user notifications
//     const currentUserNotifies = await this.userNotifyRepository.find({
//       where: { notify: { notifyId: id } },
//       relations: ['user'],
//     });

//     const currentUserIds = currentUserNotifies.map((un) => un.user.user_id);

//     // Find users to remove and add
//     const userIdsToRemove = currentUserIds.filter(
//       (id) => !newUserIds.includes(id),
//     );
//     const userIdsToAdd = newUserIds.filter(
//       (id) => !currentUserIds.includes(id),
//     );

//     // Remove notifications for users no longer in the list
//     if (userIdsToRemove.length > 0) {
//       const notifiesToRemove = currentUserNotifies.filter((un) =>
//         userIdsToRemove.includes(un.user.user_id),
//       );
//       await this.userNotifyRepository.remove(notifiesToRemove);

//       // Send remove notification via websocket
//       userIdsToRemove.forEach((userId) => {
//         const userNotify = notifiesToRemove.find(
//           (un) => un.user.user_id === userId,
//         );
//         if (userNotify) {
//           this.notifyGateway.sendRemoveToUser(userId, userNotify.id);
//         }
//       });
//     }

//     // Add notifications for new users
//     if (userIdsToAdd.length > 0) {
//       const newUsers = await this.userRepository.find({
//         where: { user_id: In(userIdsToAdd) },
//       });

//       const newUserNotifies = newUsers.map((user) =>
//         this.userNotifyRepository.create({ user, notify: updatedNotify }),
//       );

//       const savedUserNotifies =
//         await this.userNotifyRepository.save(newUserNotifies);

//       // Send new notifications via websocket
//       savedUserNotifies.forEach((userNotify) => {
//         this.notifyGateway.sendNotificationToUser(
//           userNotify.user.user_id,
//           userNotify,
//         );
//       });
//     }

//     // Update existing notifications
//     const userNotifiesToUpdate = currentUserNotifies.filter((un) =>
//       newUserIds.includes(un.user.user_id),
//     );

//     userNotifiesToUpdate.forEach((userNotify) => {
//       this.notifyGateway.sendUpdateToUser(userNotify.user.user_id, userNotify);
//     });

//     return updatedNotify;
//   }

//   async removeNotification(id: string): Promise<string> {
//     try {
//       const notify = await this.notifyRepository.findOne({
//         where: { notifyId: id },
//       });
//       if (!notify) {
//         return 'No notification found';
//       }
//       const userNotifies = await this.userNotifyRepository.find({
//         where: { notify: { notifyId: id } },
//         relations: ['user', 'notify'],
//       });

//       const userNotifyData = userNotifies.map((userNotify) => ({
//         userId: userNotify.user.user_id,
//         userNotifyId: userNotify.id,
//       }));

//       if (userNotifyData.length > 0) {
//         await this.userNotifyRepository.remove(userNotifies);
//       }

//       const notifyDeleteResult = await this.notifyRepository.delete(id);
//       if (notifyDeleteResult.affected === 0) {
//         return 'Failed to delete Notify';
//       }

//       if (userNotifyData.length > 0) {
//         userNotifyData.forEach(({ userId, userNotifyId }) => {
//           if (!userNotifyId) {
//             return;
//           }

//           this.notifyGateway.sendRemoveToUser(userId, userNotifyId);
//         });
//       }

//       return 'Successful';
//     } catch (error) {
//       throw new Error(`Failed to remove notification: ${error}`);
//     }
//   }

//   async getNotifyUserIds(id: string): Promise<string[]> {
//     const notify = await this.notifyRepository.findOne({
//       where: { notifyId: id },
//       relations: ['userNotifies', 'userNotifies.user'],
//     });

//     if (!notify) {
//       throw new Error('Thông báo không được tìm thấy');
//     }

//     return notify.userNotifies.map((un) => un.user.user_id);
//   }

//   async getNotifyCourseIds(id: string): Promise<{
//     type: string;
//     courseIds: string[];
//   }> {
//     const notify = await this.notifyRepository.findOne({
//       where: { notifyId: id },
//       relations: ['userNotifies', 'userNotifies.user'],
//     });

//     if (!notify) {
//       throw new Error('Thông báo không được tìm thấy');
//     }

//     if (notify.type !== 'COURSE') {
//       return {
//         type: notify.type,
//         courseIds: [],
//       };
//     }

//     // Lấy tất cả course IDs từ users đã được notify
//     const userIds = notify.userNotifies.map((un) => un.user.user_id);

//     const coursePurchases = await this.coursePurchasedRepository
//       .createQueryBuilder('coursePurchase')
//       .select('coursePurchase.course')
//       .where('coursePurchase.user IN (:...userIds)', { userIds })
//       .distinct(true)
//       .getMany();

//     return {
//       type: notify.type,
//       courseIds: coursePurchases.map((cp) => cp.course.courseId),
//     };
//   }
// }
