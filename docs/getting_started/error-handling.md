

# Error Handling


Handling errors can be an important part of a workflow. In this article you'll learn about timeouts, how to catch errors, retries, and recovery.

## Demo

```yaml
id: unreliable
start:
  type: scheduled
  cron: "0 * * * *"
functions:
- id: select
  image: direktiv/select:v1
  type: reusable
- id: insert
  image: direktiv/insert:v1
  type: reusable
- id: delete
  image: direktiv/delete:v1
  type: reusable
- id: cruncher
  image: direktiv/cruncher:v1
  type: reusable
- id: notify
  image: direktiv/notifier:v1
  type: reusable
states:
- id: select-rows
  type: action
  action:
    function: select
    retries:
      max_attempts: 3
      delay: PT30S
      multiplier: 2.0
      codes: [".*"]
  transform: 'jq(.return)'
  transition: crunch-numbers
  catch:
  - error: "*"
- id: crunch-numbers
  type: action
  action:
    function: cruncher
  transform: 'jq(.return)'
  transition: store-some-results
- id: store-some-results
  type: action
  action:
    function: insert
    input: 'jq(.someResults)'
  transition: store-other-results
  catch:
  - error: "*"
    transition: report-failure
- id: store-other-results
  type: action
  action:
    function: insert
    input: 'jq(.otherResults)'
  catch:
  - error: "*"
    transition: revert-store-some-results
- id: revert-store-some-results
  type: action
  action:
    function: delete
    input: 'jq(.someResults)'
  transition: report-failure
- id: report-failure
  type: action
  action:
    function: notifier
```

In this demo the `select`, `delete`, and `insert` functions are hypothetical containers that interact with a database, and the `crunch` function is a hypothetical container that produces some output from an input. The `notifier` function is a stand-in for whatever method you want to report an error: email, SMS, etc.

This demo simulates some sort of database transaction through a workflow in order to demonstrate error handling. In reality you should write a custom Isolate to actually perform a real database transaction if possible.

## Catchable Errors

Errors that occur during instance execution usually are considered "catchable". Any workflow state may optionally define error catchers, and if a catchable error is raised Direktiv will check to see if any catchers can handle it.

Errors have a "code", which is a string formatted in a style similar to a domain name. Error catchers can explicitly catch a single error code or they can use `*` wildcards in their error codes to catch ranges of errors. Setting the error catcher to just "`*`" means it will handle any error, so long as no catcher defined higher up in the list has already caught it.

If no catcher is able to handle an error, the workflow will fail immediately.

## Uncatchable Errors

Rarely, some errors are considered "uncatchable", but generally an uncatchable error becomes catchable if escalated to a calling workflow. One example of this is the error triggered by Direktiv if a workflow fails to complete within its maximum timeout.

If a workflow fails to complete within its maximum timeout it will not be given an opportunity to catch the error and continue running. But if that workflow is running as a subflow its parent workflow will be able to detect and handle that error.

## Retries

Action definitions may optionally define a retry strategy. If a retry strategy is defined the catcher's transition won't be used and no error will be escalated for retryable errors until all retries have failed. A retry strategy might look like the following:

```yaml
    retry:
      max_attempts: 3
      delay: PT30S
      multiplier: 2.0
      codes: [".*"]
```

In this example you can see that a maximum number of attempts is defined, alongside an initial delay between attempts and a multiplication factor to apply to the delay between subsequent attempts.

## Recovery

Workflows sometimes perform actions which may need to be reverted or undone if the workflow as a whole cannot complete successfully. Solving these problems requires careful use of error catchers and transitions.
