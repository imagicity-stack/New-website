# AWS Parameter Store Verification Guide

Because this local environment does not have access to your AWS account, the steps below outline how to manually verify and remediate the Amplify Parameter Store configuration in the AWS Console.

## 1. Confirm the namespace exists
1. Open the AWS Console and navigate to **Systems Manager → Parameter Store**.
2. Use the search bar to look for the namespace `/amplify/d3v73j0mj85hch/main/`.
3. If the namespace exists, open it and confirm that all parameters required by the Amplify build are present (for example, API keys, secrets, and configuration values referenced by the app). Cross-check these keys with your Amplify build logs or environment variable references in the repository.

## 2. Recreate or relink missing parameters
1. If parameters are missing or stored under a different prefix, create them in Parameter Store with the correct names and types.
2. Alternatively, update the Amplify app’s environment variables to point to the correct Parameter Store path: open the Amplify console, select the app, go to **App settings → Environment variables**, and adjust the `AMPLIFY_DIFF_DEPLOY` or other relevant environment variables so the branch resolves to the desired Parameter Store namespace.

## 3. Re-run the Amplify build
1. Trigger a rebuild for the affected branch from the Amplify Console.
2. Monitor the build logs and confirm the step **“Setting Up SSM Secrets”** completes successfully before the `npm run build` command from `amplify.yml` begins.
3. If the build fails again, review the Parameter Store configuration and environment variables for typos or missing values.

## Additional tips
- Ensure the IAM role used by Amplify has `ssm:GetParameters` permissions for the namespace.
- Remember that secure string parameters require the correct KMS key permissions.
- Consider exporting the Parameter Store hierarchy as a backup before making changes.
