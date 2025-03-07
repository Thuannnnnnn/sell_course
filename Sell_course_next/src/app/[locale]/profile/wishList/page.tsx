'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import BannerUser from '@/components/BannerUser';
import SignIn from '../../auth/login/page';
import DashBoardUser from '@/components/DashBoardUser';
import '../../../../style/UserProfilePage.css';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { fetchWishListCourse } from '@/app/api/wishListCourse/wishListCourse';
import { UserGetAllWishlist } from '@/app/type/user/User';

const WishListPage: React.FC = () => {
  const { data: session, status } = useSession();
  const t = useTranslations('wishListPage');

  const localActive = useLocale();
  const [user, setUser] = useState(session?.user || null);
  const [wishList, setWishList] = useState<UserGetAllWishlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user || !session.user.user_id) {
      setError('User not found or unauthorized.');
      setLoading(false);
      return;
    }

    setUser(session.user);
  }, [session, status]);

  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const wishListCourses = await fetchWishListCourse(user.user_id);
        setWishList(wishListCourses);
      } catch {
        setError('Failed to load wish list.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <SignIn />;


  return (
    <>
       <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="table-profile">
            <h1>{t('title')}</h1>
          {error && <div className="error-message">{error}</div>}
          <div>
            {wishList.length > 0 ? (
              <div className="cardAll">
                {wishList.map((wishlistItem) => {
                  const { course } = wishlistItem;
                  if (!course) return null;

                  return (
                    <div className="cardEnrolled" key={course.courseId}>
                      <div
                        onClick={() => (window.location.href = `/${localActive}/showCourse`)}
                        className="cardContent"
                      >
                        {course.imageInfo ? (
                          <Image
                            src={course.imageInfo}
                            alt={course.title}
                            className="cardImg"
                            width={100}
                            height={100}
                          />
                        ) : (
                          <div className="cardImgPlaceholder">No Image</div>
                        )}
                        <div className="cardInfo">
                          <p className="cardCategory">{course.categoryName || 'No Category'}</p>
                          <div className="cardTitle">
                            <h3>{course.title || 'No Title'}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">{t('noCourse')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WishListPage;
