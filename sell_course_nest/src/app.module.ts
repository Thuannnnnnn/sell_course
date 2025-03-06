import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
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
import { CoursePurchase } from './modules/course_purchase/entities/course_purchase.entity';
import { Docs } from './modules/docs/entities/docs.entity';
import { EmailVerification } from './modules/email_verifications/entities/email_verifications.entity';
import { Exam } from './modules/exam/entities/exam.entity';
import { FeedbackRatting } from './modules/feedback_ratting/entities/feedback_ratting.entity';
import { Forum } from './modules/forum/entities/forum.entity';
import { Lesson } from './modules/lesson/entities/lesson.entity';
import { OrderHistories } from './modules/order_histories/entities/order_histories.entity';
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
import { CoursePurchaseModule } from './modules/course_purchase/course_purchase.module';
import { DocsModule } from './modules/docs/docs.module';
import { EmailVerificationsModule } from './modules/email_verifications/email_verifications.module';
import { ExamModule } from './modules/exam/exam.module';
import { FeedbackRattingModule } from './modules/feedback_ratting/feedback_ratting.module';
import { ForumModule } from './modules/forum/forum.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { OrderHistoriesModule } from './modules/order_histories/order_histories.module';
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
import { UserNotify } from './modules/User_Notify/entities/user_Notify.entity';
import { NotifyModule } from './modules/notify/notify.module';
import { UserNotifyModule } from './modules/User_Notify/User_Notify.module';
import { Permission } from './modules/permission/entities/permission.entity';
import { PermissionModule } from './modules/permission/permission.module';
import { PermissionMiddleware } from './modules/permission/permission.middleware';
import { Order } from './modules/order/entities/order.entity';
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
/*
 * import { APP_GUARD } from '@nestjs/core';
 * import { PermissionsGuard } from './modules/permission/permissions.guard';
 */

@Module({
  imports: [
    VideoModule,
    ContentModule,
    PaymentModule,
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
        Notify,
        UserNotify,
        User,
        Cart,
        Certificate,
        Contents,
        Course,
        CoursePurchase,
        Docs,
        EmailVerification,
        Exam,
        ExamQuestion,
        Answer,
        FeedbackRatting,
        Forum,
        Lesson,
        OrderHistories,
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
        Order,
        ResultExam,
        ProgressTracking,
        UserNotify,
        QaStudy,
        ReactionTopic,
        Discussion,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Permission]),
    ProcessModule,
    NotifyModule,
    UserNotifyModule,
    UserModule,
    authModule,
    CartModule,
    CertificateModule,
    ContentModule,
    CourseModule,
    CoursePurchaseModule,
    DocsModule,
    EmailVerificationsModule,
    ExamModule,
    ExamQuestion,
    Answer,
    FeedbackRattingModule,
    ForumModule,
    LessonModule,
    OrderHistoriesModule,
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
    OrderModule,
    PaymentModule,
    ResultExamModule,
    QaStudyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PermissionMiddleware).forRoutes('/api/xyz/*');
  }
}
