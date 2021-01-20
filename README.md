

# Lead Time For Change Action
Calculates the lead time for change of a repository on a release

## Inputs
auth-token (required): the personal access token of the user

## Outputs
lead-time-for-change: The lead time for change from previous release to current release

## Runs using: node12
## main: index.js
## Example usage
Copy the following code into your .github/workflows/main.yml file

```yaml
on:
    release:
        types: [created]

jobs:
    calculate_lead_time_job:
        runs-on: ubuntu-latest
        name: Calculate Lead Time For Change
        steps:
        -   name: calculate lead time for change action step
            id: lead-time
            uses: SE06-Glasgow-University/lead-time-for-change-action@v1.1
            with:
                auth-token: ${{ secrets.GITHUB_TOKEN }}

        -   name: output lead time for change
            run: echo "The lead time for change in days is ${{ steps.lead-time.outputs.lead-time-for-change }}"

```

If you want to run the action using your own workflow code, feel free to, but here are the basics you need to get the program working:

``` yaml
uses: SE06-Glasgow-University/lead-time-for-change-action@v1.1
            with:
                auth-token: ${{ secrets.GITHUB_TOKEN }}

```

The above code tells your workflow to use the current newest version of the action (v1.0) and sets the required auth-token input to your own personal access token which we require to make requests to the GitHub API and to allow our action to update the releases description with the lead time for change that was calculated when the action was run.


## Owners

This project was created by team SE06, a group of 3rd year software engineering students at the University of Glasgow
If you need to get into contact with us please use the email we have setup for the project `se06.glasgow@gmail.com`
