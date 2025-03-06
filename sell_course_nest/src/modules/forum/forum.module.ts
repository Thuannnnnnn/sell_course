import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from './entities/forum.entity';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { User } from '../user/entities/user.entity';
import { ReactionTopicService } from './reaction_topic.service';
import { ReactionTopicController } from './reaction-topic.controller';
import { ReactionTopic } from './entities/reaction_topic.entity';
import { Discussion } from './entities/discussion.entity';
import { DiscussionController } from './discussion.controller';
import { DiscussionService } from './discussion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, User, ReactionTopic, Discussion])],
  controllers: [ForumController, ReactionTopicController, DiscussionController],
  providers: [ForumService, ReactionTopicService, DiscussionService],
})
export class ForumModule {}
