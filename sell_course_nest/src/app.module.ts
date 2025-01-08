import { Module } from '@nestjs/common';
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
import { QuestionsQuizz } from './modules/questions_quizz/entities/questions_quizz.entity';
import { Quizz } from './modules/quizz/entities/quizz.entity';
import { Reply } from './modules/reply/entities/reply.entity';
import { ResultExam } from './modules/result_exam/entities/result_exam.entity';
import { ResultQuizz } from './modules/result_quizz/entities/result_quizz.entity';
import { Video } from './modules/video/entities/video.entity';
import { Waitlist } from './modules/waitlist/entities/waitlist.entity';
import { Wishlist } from './modules/wishlist/entities/wishlist.entity';
import { UserModule } from './modules/user/user.module';
import { authModule } from './modules/Auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { ContentsModule } from './modules/contents/contents.module';
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
import { QuestionsQuizzModule } from './modules/questions_quizz/questions_quizz.module';
import { QuizzModule } from './modules/quizz/quizz.module';
import { ReplyModule } from './modules/reply/reply.module';
import { ResultExamModule } from './modules/result_exam/result_exam.module';
import { ResultQuizzModule } from './modules/result_quizz/result_quizz.module';
import { VideoModule } from './modules/video/video.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { Category } from './modules/category/entities/category.entity';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
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
      entities: [
        User,
        Cart,
        Certificate,
        Contents,
        Course,
        CoursePurchase,
        Docs,
        EmailVerification,
        Exam,
        FeedbackRatting,
        Forum,
        Lesson,
        OrderHistories,
        Qa,
        QuestionsExam,
        QuestionsQuizz,
        Quizz,
        Reply,
        ResultExam,
        ResultQuizz,
        Video,
        Waitlist,
        Wishlist,
        Category,
      ],
      synchronize: true,
    }),
    UserModule,
    authModule,
    CartModule,
    CertificateModule,
    ContentsModule,
    CourseModule,
    CoursePurchaseModule,
    DocsModule,
    EmailVerificationsModule,
    ExamModule,
    FeedbackRattingModule,
    ForumModule,
    LessonModule,
    OrderHistoriesModule,
    QaModule,
    QuestionsExamModule,
    QuestionsQuizzModule,
    QuizzModule,
    ReplyModule,
    ResultExamModule,
    ResultQuizzModule,
    VideoModule,
    WaitlistModule,
    WishlistModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
