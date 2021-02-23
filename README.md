# Calculate lead time for change
Calculates the lead time for change of a repository on a release
## Inputs
### auth-token (required): the personal access token of the user
### web-token (optional): the token provided by the complimentary website for authenticating post request to website
### calculate-previous-releases(optional): Default as false, if set to true the action will also calculate the lead time for the previous 5 releases unless number-of-releases is specified.
### number-of-releases(optional): Default is 5. Takes an integer n and if calculate-previous-release is set to true then the action will calculate the previous n releases.
## Outputs
### lead-time-for-change: The lead time for change from previous release to current release

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
            uses: actions/lead-time-for-change-action@v1.0
            with:
                auth-token: ${{ secrets.GITHUB_TOKEN }}
                web-token: ${{ secrets.LEAD_TIME_AUTH_TOKEN }}
                calculate-previous-releases: true
                number-of-releases: 4
                
        -   name: output lead time for change
            run: echo "The lead time for change in days is ${{ steps.lead-time.outputs.lead-time-for-change }}

```
