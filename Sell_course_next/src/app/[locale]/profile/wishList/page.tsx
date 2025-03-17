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
import { GetUser, UserGetAllWishlist } from '@/app/type/user/User';
import { CiShare2 } from "react-icons/ci";
import { AiOutlineSearch } from "react-icons/ai";
import { fetchUserDetails } from '@/app/api/auth/User/user';

const WishListPage: React.FC = () => {
  const { data: session, status } = useSession();
  const t = useTranslations('wishListPage');

  const localActive = useLocale();
  const [user, setUser] = useState(session?.user || null);
  const [wishList, setWishList] = useState<UserGetAllWishlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
      if (status === 'loading') return; // Đợi session load xong
      const token = session?.user?.token;
      const email = session?.user?.email;
      if (!session?.user || !session.user.email) {
        setError('User not found or unauthorized.');
        setLoading(false);
        return;
      }
      console.log('Session ne: ', session.user);
      const fetchUser = async () => {
        setLoading(true);
        setError(null);
        try {
          const userDetails = await fetchUserDetails(token as string, email as string);
          setUser(userDetails);
        } catch {
          setError('Failed to load user details.');
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
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

  const handleShare = (courseId: string) => {
    const shareUrl = `${window.location.origin}/${localActive}/courseDetail/${courseId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Course link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link.');
    });
  };

  const filteredWishList = wishList.filter((wishlistItem) =>
    wishlistItem.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <SignIn />;


   if (!user) {
      return <SignIn />;
   }
  return (
    <>
       <div>{user ? <BannerUser  user={user as unknown as GetUser}  /> : <SignIn />}</div>
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="table-profile">
            <h1>{t('title')}</h1>
            <div className="position-relative mb-3">
              <input
                type="text"
                className="form-control pe-5"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <AiOutlineSearch className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" size={20} />
            </div>
          {error && <div className="error-message">{error}</div>}
          <div>
            {filteredWishList.length > 0 ? (
                <div className="row">
                  {filteredWishList.map((wishlistItem) => {
                    const { course } = wishlistItem;
                    if (!course) return null;

                    return (
                      <div className="col-md-4 mb-4" key={course.courseId}>
                        <div className="card position-relative">
                          <button
                            className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle" 
                            onClick={() => handleShare(course.courseId)}
                          >
                            <CiShare2 size={20} />
                          </button>
                          <div
                            onClick={() => (window.location.href = `/${localActive}/showCourse/${course.courseId}`)}
                            className="card-body text-center cursor-pointer"
                          >
                            {course.imageInfo ? (
                              <Image
                                src={course.imageInfo}
                                alt={course.title}
                                className="card-img-top"
                                width={100}
                                height={100}
                              />
                            ) : (
                              <div className="card-img-placeholder">No Image</div>
                            )}
                            <div className="mt-3">
                              <h5 className="card-title">{course.title || 'No Title'}</h5>
                              <p className="card-text">{course.description || 'No Description'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">{t('noCourse')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </>
  );
};

export default WishListPage;
