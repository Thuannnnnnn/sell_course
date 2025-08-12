'use client';

import Image from 'next/image';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Separator } from '../../../../components/ui/separator';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Loading } from '../../../../components/ui/loading';
import { toast } from "sonner";
import {
    Clock,
    User,
    BookOpen,
    Video,
    FileText,
    HelpCircle,
    GraduationCap,
    Star,
    Calendar,
    DollarSign,
    Shield,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import {
    fetchCourseWithDetailsNew,
    reviewCourseStatus,
    CourseReviewData,
    LessonReviewData,
    ContentReviewData,
    VideoReviewData,
    DocReviewData,
    QuizReviewData,
    ExamReviewData
} from '../../../api/courses/course';
import { ContentModal, ExamModal } from '../../../../components/course/ContentModal';
import { RejectionDialog } from '../../../../components/course/RejectionDialog';
import { CourseStatus } from '../../../../app/types/course.d';

export default function CourseReviewPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const courseId = params.id as string;
    const [courseData, setCourseData] = useState<CourseReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    // Check if user has permission to review courses
    const canReviewCourse = session?.user?.role === 'COURSEREVIEWER' || session?.user?.role === 'ADMIN';
    const isInstructor = session?.user?.role === 'INSTRUCTOR';

    const handleBack = () => {
        router.back();
    };

    const handleApprove = async () => {
        if (!session?.accessToken || !courseId) return;
        
        // Check permission
        if (!canReviewCourse) {
            toast.error("You don't have permission to approve courses.");
            return;
        }
        
        try {
            setActionLoading(true);
            await reviewCourseStatus(courseId, CourseStatus.PUBLISHED, session.accessToken);
            const updatedData = await fetchCourseWithDetailsNew(session.accessToken, courseId);
            setCourseData(updatedData);
            toast.success("Course approved and published successfully!");
        } catch (error) {
            console.error('Error approving course:', error);
            toast.error("Failed to approve course. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = () => {
        // Check permission
        if (!canReviewCourse) {
            toast.error("You don't have permission to reject courses.");
            return;
        }
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = async (reason: string) => {
        if (!session?.accessToken || !courseId) return;
        
        try {
            setActionLoading(true);
            console.log('📝 Rejecting course with reason:', reason);
            
            await reviewCourseStatus(courseId, CourseStatus.REJECTED, session.accessToken, reason);
            const updatedData = await fetchCourseWithDetailsNew(session.accessToken, courseId);
            setCourseData(updatedData);
            
            toast.success("✅ Course has been rejected and notification sent to instructor!");
        } catch (error) {
            console.error('❌ Error rejecting course:', error);
            toast.error("❌ Failed to reject course. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        const loadCourseData = async () => {
            if (!session?.accessToken || !courseId) return;
            try {
                setLoading(true);
                const data = await fetchCourseWithDetailsNew(session.accessToken, courseId);
                setCourseData(data);
            } catch (err) {
                console.error('Error loading course data:', err);
                setError('Failed to load course data');
                toast.error('Failed to load course data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadCourseData();
    }, [session, courseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loading />
            </div>
        );
    }

    // Block access for instructors
    if (isInstructor) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 mb-2">Access Denied</p>
                    <p className="text-sm text-gray-500">Instructors cannot review their own courses.</p>
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="mt-4"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (error || !courseData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">{error || 'Course not found'}</p>
                </div>
            </div>
        );
    }

    const { course, lessons, exam } = courseData;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Course Review</h1>
                        <p className="text-gray-600 mt-2">Review all course content before publishing</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canReviewCourse && (
                        <>
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={handleReject}
                                disabled={actionLoading || course.status === CourseStatus.PUBLISHED || course.status === CourseStatus.REJECTED}
                            >
                                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleApprove}
                                disabled={actionLoading || course.status === CourseStatus.PUBLISHED || course.status === CourseStatus.REJECTED}
                            >
                                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                Approve
                            </Button>
                        </>
                    )}
                    {!canReviewCourse && (
                        <div className="flex items-center gap-2 text-gray-500">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm">View Only Mode</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Course Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Course Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center relative">
                                <Image 
                                    src={course.thumbnail} 
                                    alt={course.title}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                            <p className="text-gray-600 mb-4">{course.short_description}</p>
                            <div className="prose max-w-none">
                                <p>{course.description}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold">${course.price}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span>{course.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-purple-600" />
                                    <Badge variant="secondary">{course.skill}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-600" />
                                    <span>{course.level}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Instructor:</span>
                                    <span>{course.instructorName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Category:</span>
                                    <span>{course.categoryName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Created:</span>
                                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Updated:</span>
                                    <span>{new Date(course.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Course Content */}
            <Tabs defaultValue="lessons" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="lessons">Lessons & Content</TabsTrigger>
                    <TabsTrigger value="exam">Final Exam</TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="lessons" className="space-y-6">
                    {lessons.map((lesson, index) => (
                        <LessonCard key={lesson.lessonId} lesson={lesson} index={index} />
                    ))}
                </TabsContent>

                <TabsContent value="exam">
                    {exam ? (
                        <ExamCard exam={exam} />
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8">
                                <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-600">No final exam created for this course</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="statistics">
                    <StatisticsCard lessons={lessons} exam={exam} />
                </TabsContent>
            </Tabs>

            {/* Rejection Dialog */}
            <RejectionDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                onConfirm={handleRejectConfirm}
                courseName={courseData?.course?.title || 'Unknown Course'}
                loading={actionLoading}
            />
        </div>
    );
}

// Keep all the other component functions unchanged...
function LessonCard({ lesson, index }: { lesson: LessonReviewData; index: number }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                    </div>
                    {lesson.lessonName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {lesson.contents.map((content) => (
                        <ContentCard key={content.contentId} content={content} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ContentCard({ content }: { content: ContentReviewData }) {
    const getIcon = () => {
        switch (content.contentType) {
            case 'video':
                return <Video className="h-4 w-4" />;
            case 'doc':
                return <FileText className="h-4 w-4" />;
            case 'quiz':
                return <HelpCircle className="h-4 w-4" />;
            case 'quizz':
                return <HelpCircle className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getTypeColor = () => {
        switch (content.contentType) {
            case 'video':
                return 'bg-red-100 text-red-600';
            case 'doc':
                return 'bg-blue-100 text-blue-600';
            case 'quiz':
                return 'bg-green-100 text-green-600';
            case 'quizz':
                return 'bg-green-100 text-green-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };
    return (
        <div className="border rounded-lg p-4 ml-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor()}`}>
                        {getIcon()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-medium break-words whitespace-normal">{content.contentName}</h4>
                        <Badge variant="outline" className="text-xs">
                            {content.contentType.toUpperCase()}
                        </Badge>
                    </div>
                </div>
                <ContentModal content={content} />
            </div>

            {content.video && <VideoContent video={content.video} />}
            {content.doc && <DocContent doc={content.doc} />}
            {content.quiz && <QuizContent quiz={content.quiz} />}
            {(content.contentType === 'quiz' || content.contentType === 'quizz') && !content.quiz && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                        📝 Quiz content - No questions available or loading...
                    </p>
                </div>
            )}
            {content.contentType === 'video' && !content.video && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">
                        🎥 Video content - No video data available
                    </p>
                </div>
            )}
            {content.contentType === 'doc' && !content.doc && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                        📄 Document content - No document data available
                    </p>
                </div>
            )}
        </div>
    );
}
function VideoContent({ video }: { video: VideoReviewData }) {
    return (
        <div className="bg-red-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">🎥 {video.title}</h5>
            <p className="text-sm text-gray-600 mb-3">{video.description}</p>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                </div>
                {video.urlScript && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Script:</span>
                        <span className="text-xs text-green-600">Available</span>
                    </div>
                )}
            </div>
        </div>
    );
}
function DocContent({ doc }: { doc: DocReviewData }) {
    return (
        <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">📄 {doc.title}</h5>
            <div className="flex items-center gap-2">
            </div>
        </div>
    );
}
function QuizContent({ quiz }: { quiz: QuizReviewData }) {
    return (
        <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">📝 Quiz ({quiz.questions.length} questions)</h5>
        </div>
    );
}
function ExamCard({ exam }: { exam: ExamReviewData }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Final Exam ({exam.questions.length} questions)
                    </div>
                    <ExamModal exam={exam} />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <div className="space-y-4">
                        {exam.questions.map((question, index) => (
                            <div key={question.questionId} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="font-medium">Question {index + 1}:</span>
                                    <Badge variant="outline" className="text-xs">
                                        {question.difficulty}
                                    </Badge>
                                    <span className="text-xs text-gray-500">Weight: {question.weight}</span>
                                </div>
                                <p className="mb-3">{question.question}</p>
                                <div className="space-y-2">
                                    {question.answers.map((answer) => (
                                        <div key={answer.answerId} className={`p-2 rounded ${
                                            answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                                        }`}>
                                            {answer.isCorrect && <CheckCircle className="h-4 w-4 inline mr-2" />}
                                            {answer.answer}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
function StatisticsCard({ lessons, exam }: { lessons: LessonReviewData[]; exam?: ExamReviewData }) {
    const totalLessons = lessons.length;
    const totalContents = lessons.reduce((sum, lesson) => sum + lesson.contents.length, 0);
    const videoCount = lessons.reduce((sum, lesson) => 
        sum + lesson.contents.filter(content => content.contentType === 'video').length, 0
    );
    const docCount = lessons.reduce((sum, lesson) => 
        sum + lesson.contents.filter(content => content.contentType === 'doc').length, 0
    );
    const quizCount = lessons.reduce((sum, lesson) => 
        sum + lesson.contents.filter(content => content.contentType === 'quiz' || content.contentType === 'quizz').length, 0
    );
    const totalQuizQuestions = lessons.reduce((sum, lesson) => 
        sum + lesson.contents.reduce((contentSum, content) => 
            contentSum + (content.quiz?.questions.length || 0), 0
        ), 0
    );
    const examQuestions = exam?.questions.length || 0;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{totalLessons}</div>
                        <div className="text-sm text-gray-600">Lessons</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{totalContents}</div>
                        <div className="text-sm text-gray-600">Contents</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <Video className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-600">{videoCount}</div>
                        <div className="text-sm text-gray-600">Videos</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{docCount}</div>
                        <div className="text-sm text-gray-600">Documents</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <HelpCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{quizCount}</div>
                        <div className="text-sm text-gray-600">Quizzes</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <HelpCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{totalQuizQuestions}</div>
                        <div className="text-sm text-gray-600">Quiz Questions</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <GraduationCap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-600">{examQuestions}</div>
                        <div className="text-sm text-gray-600">Exam Questions</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Star className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-600">{totalQuizQuestions + examQuestions}</div>
                        <div className="text-sm text-gray-600">Total Questions</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}