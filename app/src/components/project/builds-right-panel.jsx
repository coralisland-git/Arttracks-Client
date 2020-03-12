import React from 'react';
import { Accordion, BPanel } from '@sketchpixy/rubix';

class BuildsRightPanel extends React.Component {
  render() {
    return (
      <div className="body-sidebar__element pr5-imp pl5-imp">
        <h4 className="header">Build Bot Guide</h4>
        <p>Here is a short guide about the different stages that our build bots may have your video build job in at any given time.</p>

        <Accordion className="build-status">
          <BPanel header="Pending" eventKey="1">
            Your build request is awaiting assignment to a job queue.
          </BPanel>
          <BPanel header="Queued" eventKey="2">
            Your build request has been assigned to a job queue and is awaiting a build bot worker to pick up the job.
          </BPanel>
          <BPanel header="Processing" eventKey="3">
            A build bot worker has picked up your build request and is performing pre-build operation requirements.
          </BPanel>
          <BPanel header="Building" eventKey="4">
            A build bot worker has begun building all elements required to create a video for your job request.
          </BPanel>
          <BPanel header="Encoding" eventKey="5">
            A build bot worker is creating your final video and encoding it into the mobile-ready .mp4 format.
          </BPanel>
          <BPanel header="Complete" eventKey="6">
            Your build job is done and the video is now available for viewing, download, and distribution.
          </BPanel>
          <BPanel header="Locked" eventKey="7">
            Your build job is complete, but your time balance is insufficient. You can unlock this video once you have updated your time balance.
          </BPanel>
          <BPanel header="Failed" eventKey="8">
            For some reason your build job did not complete successfully and we are looking into it.
          </BPanel>
        </Accordion>
      </div>
    );
  }
}

export default BuildsRightPanel;
