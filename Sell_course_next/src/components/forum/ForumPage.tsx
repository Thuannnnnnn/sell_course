import React from "react";
import ForumList from "./ForumList";

const ForumPage: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <ForumList />
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
