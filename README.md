# Calculate lead time for change
Calculates the lead time for change of a repository on a release
## Inputs
### auth-token (required): the personal access token of the user
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
        runs-on: ubuntu-latests
        name: Calculate Lead Time For Change
        steps:
        -   name: calculate lead time for change action step
            id: lead-time
            uses: actions/lead-time-for-change-action@v1.0
            with:
                auth-token: ${{ secrets.GITHUB_TOKEN }}

        -   name: output lead time for change
            run: echo "The lead time for change in days is ${{ steps.lead-time.outputs.lead-time-for-change }}

```
