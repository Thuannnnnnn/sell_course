// import React from 'react';
// import '../style/BannerUser.css';
// import defaultAvatar from '../app/image/defait-img.png';
// import Image from 'next/image';

// // Define the type for the user prop
// interface User {
//   avartaImg?: string;
//   name?: string;
// }

// interface BannerUserProps {
//   user: User;
// }

// export default function BannerUser({ user }: BannerUserProps) {
//   return (
//     <div className="card">
//       <div className="avatar">
//         <Image
//           src={user.avartaImg || defaultAvatar}
//           alt="User Avatar"
//           className="avatar-img"
//           width={100}
//           height={100}
//         />
//       </div>
//       <span className="name">{user.name || 'Unknown User'}</span>
//     </div>
//   );
// }


import React from 'react';
import '../style/BannerUser.css';
import defaultAvatar from '../app/image/defait-img.png';
import Image from 'next/image';

// Define the type for the user prop
interface User {
  avartaImg?: string;
  name?: string;
}

interface BannerUserProps {
  user: User;
}

export default function BannerUser({ user }: BannerUserProps) {
  return (
    <div className="card">
      <div className="avatar">
        <Image
          src={user.avartaImg || defaultAvatar}
          alt="User Avatar"
          className="avatar-img"
          layout="fixed"
          width={100}
          height={100}
        />
      </div>
      <span className="name">{user.name || 'Unknown User'}</span>
    </div>
  );
}
