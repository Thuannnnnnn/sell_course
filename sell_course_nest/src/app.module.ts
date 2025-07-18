import { PaymentModule } from './modules/payment/payment.module';
import { MeetingModule } from './modules/meeting/meeting.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
// app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/user/entities/user.entity';
import { Cart } from './modules/cart/entities/cart.entity';
import { Certificate } from './modules/certificate/entities/certificate.entity';
import { Contents } from './modules/contents/entities/contents.entity';
import { Course } from './modules/course/entities/course.entity';
import { Docs } from './modules/docs/entities/docs.entity';

import { Exam } from './modules/exam/entities/exam.entity';
import { FeedbackRatting } from './modules/feedback_ratting/entities/feedback_ratting.entity';
import { Forum } from './modules/forum/entities/forum.entity';
import { Lesson } from './modules/lesson/entities/lesson.entity';
import { Qa } from './modules/qa/entities/qa.entity';
import { QuestionsExam } from './modules/questions_exam/entities/questions_exam.entity';
import { Quizz } from './modules/quizz/entities/quizz.entity';
import { Reply } from './modules/reply/entities/reply.entity';
import { Video } from './modules/video/entities/video.entity';
import { Waitlist } from './modules/waitlist/entities/waitlist.entity';
import { Wishlist } from './modules/wishlist/entities/wishlist.entity';
import { UserModule } from './modules/user/user.module';
import { authModule } from './modules/Auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { ContentModule } from './modules/contents/contents.module';
import { CourseModule } from './modules/course/course.module';
import { DocsModule } from './modules/docs/docs.module';

import { ExamModule } from './modules/exam/exam.module';
import { FeedbackRattingModule } from './modules/feedback_ratting/feedback_ratting.module';
import { ForumModule } from './modules/forum/forum.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { QaModule } from './modules/qa/qa.module';
import { QuestionsExamModule } from './modules/questions_exam/questions_exam.module';
import { QuizzModule } from './modules/quizz/quizz.module';
import { ReplyModule } from './modules/reply/reply.module';
import { VideoModule } from './modules/video/video.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { Category } from './modules/category/entities/category.entity';
import { CategoryModule } from './modules/category/category.module';
import { Notify } from './modules/notify/entities/notify.entity';
import { UserNotify } from './modules/User_Notify/entities/User_Notify.entity';
import { NotifyModule } from './modules/notify/notify.module';
import { UserNotifyModule } from './modules/User_Notify/User_Notify.module';
import { Permission } from './modules/permission/entities/permission.entity';
import { PermissionModule } from './modules/permission/permission.module';
import { PermissionMiddleware } from './modules/permission/permission.middleware';
import { ExamQuestion } from './modules/exam/entities/examQuestion.entity';
import { Answer } from './modules/exam/entities/answerExam.entity';
import { Questionentity } from './modules/quizz/entities/question.entity';
import { AnswerEntity } from './modules/quizz/entities/answer.entity';
import { QuizzStore } from './modules/quizz_store/entities/quizz_store.entity';
import { QuizzStoreModule } from './modules/quizz_store/quizz_store.module';
import { ResultExamModule } from './modules/result_exam/result_exam.module';
import { ResultExam } from './modules/result_exam/entities/result_exam.entity';
import { ProgressTracking } from './modules/progress_tracking/entities/progress.entity';
import { ProcessModule } from './modules/progress_tracking/progress.module';
import { QaStudyModule } from './modules/qa_study/qa_study.module';
import { QaStudy } from './modules/qa_study/entities/qa.entity';
import { ReactionTopic } from './modules/forum/entities/reaction_topic.entity';
import { Discussion } from './modules/forum/entities/discussion.entity';
import { ReactionQa } from './modules/qa_study/entities/reaction_qa.entity';
import { Interaction } from './modules/Interaction/entities/Interaction.entity';
import { InteractionModule } from './modules/Interaction/interaction.module';
import { QuestionHabit } from './modules/questionHabit/entities/questionHabit.entity';
import { UserAnswer } from './modules/userAnswer/entities/userAnswer.entity';
import { QuestionHabitModule } from './modules/questionHabit/questionHabit.module';
import { UserAnswerModule } from './modules/userAnswer/userAnswer.module';
import { SupportChatModule } from './modules/support_chat/chat_support.module';
import { ChatSession } from './modules/support_chat/entities/chat-session.entity';
import { Message } from './modules/support_chat/entities/message.entity';
import { Promotion } from './modules/promotion/entities/promotion.entity';
import { PromotionModule } from './modules/promotion/promotion.module';
import { CarouselSettingModule } from './modules/carouselSetting/setting.module';
import { CarouselSetting } from './modules/carouselSetting/entities/setting.entity';
import { LogoSetting } from './modules/logoSetting/entities/LogoSetting.entity';
import { LogoSettingModule } from './modules/logoSetting/logoSetting.module';
import { VersionSettingModule } from './modules/vesionSetting/vesionSetting.module';
import { VersionSetting } from './modules/vesionSetting/entities/vesionSetting.entity';
import { Meeting } from './modules/meeting/entities/meeting.entity';
import { MeetingParticipant } from './modules/meeting/entities/meeting-participant.entity';
import { OTP } from './modules/otp/entities/otp.entity';
import { OtpModule } from './modules/otp/otp.module';
import { Enrollment } from './modules/enrollment/entities/enrollment.entity';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';

/*
 * import { APP_GUARD } from '@nestjs/core';
 * import { PermissionsGuard } from './modules/permission/permissions.guard';
 */
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { PlanConstraint } from './modules/plan-constraint/plan-constraint.entity';
import { PlanPreference } from './modules/plan-preference/plan-preference.entity';
import { LearningPlan } from './modules/learning-plan/learning-plan.entity';
import { ScheduleItem } from './modules/schedule_item/entities/schedule_item.entity';
import { SurveyResponse } from './modules/survey-response/survey-response.entity';
import { ScheduleItemModule } from './modules/schedule_item/schedule_item.module';
import { PlanConstraintModule } from './modules/plan-constraint/plan-constraint.module';
import { PlanPreferenceModule } from './modules/plan-preference/plan-preference.module';
import { LearningPlanModule } from './modules/learning-plan/learning-plan.module';
import { SurveyResponseModule } from './modules/survey-response/survey-response.module';
@Module({
  imports: [
    VideoModule,
    ContentModule,
    PaymentModule,
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      port: 6379,
      ttl: 300,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      // ssl: {
      //   rejectUnauthorized: false,
      // },
      entities: [
        PlanConstraint,
        PlanPreference,
        LearningPlan,
        ScheduleItem,
        SurveyResponse,
        LogoSetting,
        VersionSetting,
        Interaction,
        MeetingParticipant,
        CarouselSetting,
        Meeting,
        QuestionHabit,
        UserAnswer,
        Notify,
        UserNotify,
        User,
        Cart,
        Certificate,
        Contents,
        Course,
        Docs,
        Exam,
        ExamQuestion,
        Answer,
        FeedbackRatting,
        Forum,
        Lesson,
        Qa,
        QuestionsExam,
        Quizz,
        Questionentity,
        AnswerEntity,
        QuizzStore,
        Reply,
        Video,
        Waitlist,
        Wishlist,
        Category,
        Permission,
        ResultExam,
        ProgressTracking,
        UserNotify,
        QaStudy,
        ReactionTopic,
        Discussion,
        ReactionQa,
        ChatSession,
        Message,
        Promotion,
        OTP,
        Enrollment,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Permission]),
    ScheduleItemModule,
    PlanConstraintModule,
    PlanPreferenceModule,
    LearningPlanModule,
    SurveyResponseModule,
    LogoSettingModule,
    VersionSettingModule,
    QuestionHabitModule,
    UserAnswerModule,
    InteractionModule,
    ProcessModule,
    NotifyModule,
    UserNotifyModule,
    UserModule,
    authModule,
    CartModule,
    CertificateModule,
    ContentModule,
    CourseModule,
    DocsModule,
    ExamModule,
    ExamQuestion,
    Answer,
    FeedbackRattingModule,
    ForumModule,
    LessonModule,
    QaModule,
    QuestionsExamModule,
    QuizzStoreModule,
    QuizzModule,
    ReplyModule,
    VideoModule,
    WaitlistModule,
    WishlistModule,
    CategoryModule,
    PermissionModule,
    PaymentModule,
    ResultExamModule,
    QaStudyModule,
    SupportChatModule,
    PromotionModule,
    CarouselSettingModule,
    MeetingModule,
    OtpModule,
    EnrollmentModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PermissionMiddleware).forRoutes('/api/xyz/*');
  }
}
