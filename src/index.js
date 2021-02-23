// required packages
const { request } = require('@octokit/request'); // to handle the http requests to GitHub API
const core = require('@actions/core'); // to get input from workflow/set output to workflow
const github = require('@actions/github'); // to get the release object from the payload on trigger
const axios = require('axios');

/*
getSha gets the sha attribute for a release using GitHub API
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
tageName: the tag name associated with the release that we want to get the sha for
token: the owners personal access token used for authentication of the API request
returns sha attribute or sets failure if unsuccessful
*/
const getSHA = async (owner, repo, tagName, token) => {
  try {
    const response = await request(
      'GET /repos/{owner}/{repo}/git/refs/tags/{tagName}',
      {
        headers: {
          authorization: `token ${token}`,
        },
        owner: owner,
        repo: repo,
        tagName: tagName,
      },
    );
    return response.data.object.sha;
  } catch (error) {
    core.setFailed(error.message);
  }
};

/*
getCommitsList gets a list of commits that are contained within a release from the GitHub API
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
releaseSha: the sha attribute of the release to get the commits from
pageNumber: the page number used to traverse through the commits(API caps at 30 commits per page)
token: the owners personal access token used for authentication of the API request
returns the list of commits in release or sets failure if unsuccessful
*/
const getCommitsList = async (
  owner,
  repo,
  releaseSha,
  pagenumber,
  token,
  sinceDate,
) => {
  try {
    if (sinceDate === 0) {
      const response = await request(
        'GET /repos/{owner}/{repo}/commits?sha={releaseSha}&page={pagenumber}',
        {
          headers: {
            authorization: `token ${token}`,
          },
          owner: owner,
          repo: repo,
          releaseSha: releaseSha,
          pagenumber: pagenumber,
        },
      );
      return response.data;
    } else {
      const response = await request(
        'GET /repos/{owner}/{repo}/commits?sha={releaseSha}&since={sinceDate}&page={pagenumber}',
        {
          headers: {
            authorization: `token ${token}`,
          },
          owner: owner,
          repo: repo,
          releaseSha: releaseSha,
          sinceDate: sinceDate,
          pagenumber: pagenumber,
        },
      );
      return response.data;
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

/*
getNumReleases calculates the number of releases of a repo
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
token: the owners personal access token used for authentication of the API request
returns the integer number of releases in the repo
*/
const getNumReleases = async (owner, repo, token) => {
  try {
    const response = await request('GET /repos/{owner}/{repo}/releases', {
      headers: {
        authorization: `token ${token}`,
      },
      owner: owner,
      repo: repo,
    });
    return response.data.length;
  } catch (error) {
    core.setFailed(error.message);
  }
};

/*
getReleaseData gets the release data at index n in release list
The data object contains the number of commits since the release
and the data of the release at n.
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
releaseSha: the sha of the most recent release
token: the owners personal access token used for authentication of the API request
n: the index to get release from
returns data object, which contains the number of commits
 since release and the data of the release at n or sets failure if unsuccessful
*/
const getReleaseData = async (owner, repo, releaseSha, token, n) => {
  try {
    let data = {
      numCommits: 0,
      firstDate: '',
    };
    const response = await request('GET /repos/{owner}/{repo}/releases', {
      headers: {
        authorization: `token ${token}`,
      },
      owner: owner,
      repo: repo,
    });
    let previousRelease = response.data[n]; //get release at index n of list
    data.firstDate = previousRelease.created_at;

    data.numCommits = await getNumCommits(
      owner,
      repo,
      releaseSha,
      token,
      data.firstDate,
    );

    return data;
  } catch (error) {
    core.setFailed(error.message);
  }
};

const getRelease = async (owner, repo, token, n) => {
  try {
    const response = await request('GET /repos/{owner}/{repo}/releases', {
      headers: {
        authorization: `token ${token}`,
      },
      owner: owner,
      repo: repo,
    });

    let res = response.data[n];
    return {
      id: res.id,
      createdAt: new Date(res.created_at),
      tagName: res.tag_name,
      body: res.body,
    }; //get release at index n of list;
  } catch (error) {
    core.setFailed(error.message);
  }
};

/*
getCommitData gets the data of the date of the first commit since last release
and gets the number of total commits since that date
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
releaseSha: the sha of the most recent release
token: the owners personal access token used for authentication of the API request
n: the index to get release from
returns data object, which contains the number of commits
 since release and the data of the release at n or sets failure if unsuccessful
*/
const getCommitData = async (owner, repo, releaseSha, token, sinceDate) => {
  try {
    let pagenumber = 1;
    let foundLast = false;
    let lastItem;
    let commitList;

    let data = {
      numCommits: 0,
      firstDate: '',
    };

    while (foundLast === false) {
      commitList = await getCommitsList(
        owner,
        repo,
        releaseSha,
        pagenumber,
        token,
        sinceDate,
      );
      // check if list has elements
      if (!(commitList === undefined || commitList.length === 0)) {
        lastItem = commitList[commitList.length - 1];
        data.numCommits += commitList.length;
        pagenumber += 1;
      } else {
        foundLast = true;
      }
    }
    data.firstDate = lastItem.commit.author.date;
    return data;
  } catch (error) {
    core.setFailed(error.message);
  }
};

/*
getNumCommits calculates the number of commits since previous release
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
releaseSha: the sha of the current release
token: the owners personal access token used for authentication of the API request
returns the number of commits
*/
const getNumCommits = async (owner, repo, releaseSha, token, sinceDate) => {
  try {
    let numCommits = 0;
    let pagenumber = 1;
    let foundLast = false;
    let commitList;

    while (foundLast === false) {
      commitList = await getCommitsList(
        owner,
        repo,
        releaseSha,
        pagenumber,
        token,
        sinceDate,
      );
      // check if list has elements
      if (!(commitList === undefined || commitList.length === 0)) {
        numCommits += commitList.length;
        pagenumber += 1;
      } else {
        foundLast = true;
      }
    }
    return numCommits;
  } catch (error) {
    core.setFailed(error.message);
  }
};

/*
getLeadTime calculates the lead time for change of a release in days
(age=(time of release - time of first commit) / number of commits)
createdAt: the date/time that the release was created at
firstTime: The date/time of the first commit since previous release
numCommits: the number of commits made between firstTime and createdAt
returns the lead time for change or sets failure if unsuccessful
*/
const getLeadTime = (createdAt, firstTime, numCommits) => {
  if (numCommits === 0) {
    throw { code: 1, message: 'No commits since last release' };
  } else if (numCommits < 0) {
    throw { code: 1, message: 'Number of commits is negative' };
  }
  try {
    let firstTimeObj = new Date(firstTime);
    let timeDiff = Math.abs(createdAt.getTime() - firstTimeObj.getTime());
    let numDays = (timeDiff / (1000 * 60 * 60 * 24)).toFixed(2);
    return (numDays / numCommits).toFixed(2); // lead time for change
  } catch (error) {
    core.setFailed(error.message);
  }
};

/*
updateReleaseBody updates a given releases body description with the calculated lead time using the GitHub API
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
releaseID: the ID associated with the release to be updates
token: the owners personal access token used for authentication of the API request
body: the new body to update the release with (includes the old description but with appended lead time)
returns true if successful, false otherwise
*/
const updateReleaseBody = async (owner, repo, releaseID, token, body) => {
  try {
    await request('PATCH /repos/{owner}/{repo}/releases/{releaseID}', {
      headers: {
        authorization: `token ${token}`,
      },
      owner: owner,
      repo: repo,
      releaseID: releaseID,
      body: body,
    });
    return true;
  } catch (error) {
    core.setFailed(error.message);
    return false;
  }
};

/*
sendDataToWebsite updates a given releases body description with the calculated lead time using the GitHub API
repo: the name of the GitHub repository
webToken: the organisations secret web token for authenticating into the website
tagName: the releases tag name
createdAt: the date and time that the release was made
leadTimeForChange: The calculated lead time for change
returns true if successful, false otherwise
*/
const sendDataToWebsite = async (
  ownerName,
  repo,
  webToken,
  tagName,
  createdAt,
  leadTimeForChange,
) => {
  try {
    const response = await axios.post(
      'https://europe-west3-se06-website.cloudfunctions.net/api/repo/access',
      {
        ownerName: ownerName,
        token: webToken,
        repoName: repo,
        tag: tagName,
        created_at: createdAt,
        lead_time: leadTimeForChange,
      },
    );
    console.log(response);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/*
run is the main function for the action
the function gets the necessary starting data from the payload
then calls each function to get the lead time for change
sets the output as either the lead time for change on success
or sets failure if otherwise
*/
const run = async (
  i,
  ownerName,
  repo,
  id,
  tagName,
  createdAt,
  body,
  token,
  webToken,
  numReleases,
) => {
  try {
    let releaseSha = await getSHA(ownerName, repo, tagName, token);

    let data;
    if (i + 1 >= numReleases) {
      data = await getCommitData(ownerName, repo, releaseSha, token, 0);
    } else {
      data = await getReleaseData(ownerName, repo, releaseSha, token, i + 1);
    }

    let leadTimeForChange = await getLeadTime(
      createdAt,
      data.firstDate,
      data.numCommits,
    );

    let newBodyDescription = `${body} \n Lead Time For Change In Days ${leadTimeForChange}`;
    let successfulUpdate = await updateReleaseBody(
      ownerName,
      repo,
      id,
      token,
      newBodyDescription,
    );

    if (successfulUpdate) {
      console.log(
        `${tagName} release (ID = ${id}) description updated successfully`,
      );
    } else {
      console.log(
        `${tagName} release (ID = ${id}) description could not be updated`,
      );
    }

    if (webToken) {
      const successfulSendData = await sendDataToWebsite(
        ownerName,
        repo,
        webToken,
        tagName,
        createdAt,
        leadTimeForChange,
      );
      if (successfulSendData === true) {
        console.log('results posted to website successfully');
      } else {
        console.log('results posted to website unsuccessfully');
      }
    } else {
      core.info('web token not supplied: skipping step');
    }

    console.log(
      `${tagName} Lead Time For Change in Days: ${leadTimeForChange}`,
    );

    if (i === 0) {
      core.setOutput('lead-time-for-change', leadTimeForChange);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

const main = async () => {
  try {
    // extract data from release payload that triggered action
    const { repository } = github.context.payload;
    const ownerName = repository.owner.login;
    const repo = repository.name;

    const token = core.getInput('auth-token'); // required by user to authenticate into GitHub API
    const calculatePreviousReleases = core.getInput(
      'calculate-previous-releases',
    );
    const webToken = core.getInput('web-token');

    let n;
    if (calculatePreviousReleases === 'true') {
      n = Math.abs(parseInt(core.getInput('number-of-releases'), 10)); //get number of releases as integer
    } else {
      n = 1;
    }

    const numReleases = await getNumReleases(ownerName, repo, token);

    if (numReleases < n) {
      console.log(
        `cannot calculate lead time for change of ${n} releases as there is only ${numReleases} releases in repo`,
      );
      console.log(`calculating for ${numReleases} releases instead`);
      n = numReleases;
    }

    for (let i = 0; i < n; i++) {
      let { id, tagName, createdAt, body } = await getRelease(
        ownerName,
        repo,
        token,
        i,
      );
      await run(
        i,
        ownerName,
        repo,
        id,
        tagName,
        createdAt,
        body,
        token,
        webToken,
        numReleases,
      );
    }
  } catch (e) {
    core.setFailed(e.message);
  }
};

main();
