function getLearnerData(courseInfo, assignmentGroup, submissions) {
  try {
    if (assignmentGroup.course_id !== courseInfo.id) {
      throw new Error("this group doesn't belong to this course");
    }

    const current = new Date();
    const results = [];

    // using reduce instead of for-loop
    const dueAssignments = assignmentGroup.assignments.reduce(
      (dueAssignments, assign) => {
        if (new Date(assign.due_at) <= current) {
          dueAssignments.push(assign); 
        }
        return dueAssignments;
      },
      []
    );

    const learners = {};
    for (let sub of submissions) {
      const learnerId = sub.learner_id;
      const assignmentId = sub.assignment_id;

      if (!learners[learnerId]) {
        learners[learnerId] = {};
      }

      learners[learnerId][assignmentId] = sub.submission;
    }

    for (let learnerId in learners) {
      const learnerData = { id: Number(learnerId) };
      let totalEarned = 0;
      let totalPossible = 0;

      for (let assign of dueAssignments) {
        const submission = learners[learnerId][assign.id]; //list
        if (!submission) continue;

        const possible = assign.points_possible;
        if (possible === 0) continue;
        //=== means value and type
        let score = submission.score;

        const submittedLate =
          new Date(submission.submitted_at) > new Date(assign.due_at);

        if (submittedLate) {
          score -= possible * 0.1;
        }

        const percent = score / possible;

        learnerData[assign.id] = percent;

        totalEarned += score;
        totalPossible += possible; //comparison. greater or equal
      }

      learnerData.avg = totalEarned / totalPossible;
      results.push(learnerData); //push means adding on to a list or data
    }

    return results;

  } catch (err) {
    console.error("Error:", err.message);
  }
}
