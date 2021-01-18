// required packages
const { request } = require('@octokit/request'); // to handle the http requests to GitHub API
const core = require('@actions/core'); // to get input from workflow/set output to workflow
const github = require('@actions/github'); // to get the release object from the payload on trigger

/* 
getSha gets the sha attribute for a release using GitHub API
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
tageName: the tag name asscoiated with the release that we want to get the sha for
token: the owners personal access token used for authentication of the API request
returns sha attribute or sets failure if unsuccesful
*/
const getSHA = async (owner, repo, tagName, token) => {
	try {
		const response = await request('GET /repos/{owner}/{repo}/git/refs/tags/{tagName}', {
			headers : {
				authorization : `token ${token}`,
			},
			owner   : owner,
			repo    : repo,
			tagName : tagName,
		});
		const sha = response.data.object.sha;
		return sha;
	} catch (error) {
		core.setFailed(error.message);
		return;
	}
};

/*
getCommitsList gets a list of commits that are contained within a release from the GitHub API
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
releaseSha: the sha attribute of the release to get the commits from
pageNumber: the page number used to travserse through the commits(API caps at 30 commits per page)
token: the owners personal access token used for authentication of the API request
returns the list of commits in release or sets failuire if unsuccessful
*/
const getCommitsList = async (owner, repo, releaseSha, pagenumber, token, sinceDate) => {
	try {
		const response = await request(
			'GET /repos/{owner}/{repo}/commits?sha={releaseSha}&since={sinceDate}&page={pagenumber}',
			{
				headers    : {
					authorization : `token ${token}`,
				},
				owner      : owner,
				repo       : repo,
				releaseSha : releaseSha,
				sinceDate  : sinceDate,
				pagenumber : pagenumber,
			},
		);
		return response.data;
	} catch (error) {
		core.setFailed(error.message);
		return;
	}
};

/*
getReleaseNDate gets the release at index n in release list
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
token: the owners personal access token used for authentication of the API request
n: the index to get releasse from
returns the date of the previous release or sets failuire if unsuccessful
*/
const getReleaseNDate = async (owner, repo, token, n) => {
	try {
		const response = await request('GET /repos/{owner}/{repo}/releases', {
			headers : {
				authorization : `token ${token}`,
			},
			owner   : owner,
			repo    : repo,
		});
		var previousRelease = response.data[1]; //get release at index n of list
		return previousRelease.created_at;
	} catch (error) {
		core.setFailed(error.message);
		return;
	}
};

/*
getLeadTime calulates the lead time for change of a release in days 
(age=(time of release - time of first commit) / number of commits)
owner: the owner of the GitHub repository
repo: the name of the GitHub repository
createdAt: the date object from when the release was created
token: the owners personal access token used for authentication of the API request
sinceDate: the date of previous release to get commits since
returns the lead time for change or sets failuire if unsuccessful
*/
const getLeadTime = async (owner, repo, releaseSha, createdAt, token, sinceDate) => {
	var numCommits = 0;
	var pagenumber = 1;
	var foundLast = false;

	while (foundLast == false) {
		var commitList = await getCommitsList(owner, repo, releaseSha, pagenumber, token, sinceDate);

		// check if list has elements
		if (!(commitList === undefined || commitList.length == 0)) {
			numCommits += commitList.length;
			var lastItem = commitList[commitList.length - 1];
			var firstTime = new Date(lastItem.commit.author.date);
			pagenumber += 1;
		} else {
			foundLast = true;
		}
	}

	var timeDiff = createdAt.getTime() - firstTime.getTime();
	var numDays = (timeDiff / (1000 * 60 * 60 * 24)).toFixed(2);

	var leadTimeForChange = (numDays / numCommits).toFixed(2);

	return leadTimeForChange;
};

/*
updateReleaseBody updates a given releases body desciption with the calculated lead time using the GitHub API
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
			headers   : {
				authorization : `token ${token}`,
			},
			owner     : owner,
			repo      : repo,
			releaseID : releaseID,
			body      : body,
		});
		return true;
	} catch (error) {
		core.setFailed(error.message);
		return false;
	}
};

/*
run is the main function for the action
the function gets the nessessary starting data from the payload
then calls each function to get the lead time for change
sets the output as either the lead time for change on success
or sets failure if otherwise
*/
const run = async () => {
	try {
		var { repository, release } = github.context.payload;

		var ownerName = repository.owner.login;
		var repo = repository.name;

		var releaseID = release.id;
		var tagName = release.tag_name;
		var createdAt = new Date(release.created_at);
		var currentBody = release.body;

		var token = core.getInput('auth-token');

		var releaseSha = await getSHA(ownerName, repo, tagName, token);

		var previousReleaseDate = await getReleaseNDate(ownerName, repo, token, 1);

		var leadTimeForChange = await getLeadTime(ownerName, repo, releaseSha, createdAt, token, previousReleaseDate);

		var newBodyDescription = `${currentBody} \n Lead Time For Change In Days ${leadTimeForChange}`;
		var successfullUpdate = await updateReleaseBody(ownerName, repo, releaseID, token, newBodyDescription);

		if (successfullUpdate) {
			console.log(`${tagName} release (ID = ${releaseID}) description updated successfully`);
		} else {
			console.log(`${tagName} release (ID = ${releaseID}) description could not be updated`);
		}

		core.setOutput('lead-time-for-change', leadTimeForChange);
		console.log(`Lead Time For Change in Days: ${leadTimeForChange}`);
		return;
	} catch (error) {
		core.setFailed(error.message);
		return;
	}
};

run();
