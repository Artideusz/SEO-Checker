# SEO-Checker 1.0.0

This is a validation tool to check for SEO issues, like dead links, mixed content or the responsiveness of the website. It also has a CLI that allows a SEO developer to use it out-of-the-box!

## List of Services

These are the services SEO-Checker provides:
- **Dead link check (deadLinkCheck)**
    - Traverses the whole website in search for a broken page.
- **Status code (statusCode)**
    - Checks the status code of a website, as well as the overall response time.
- **Find Link Source (findLinkSrc)**
    - Searches for a specific link, and returns the source.
- **Check FTP credentials (loginFTPCheck)**
- **Check Wordpress credentials (loginWPCheck)**
- **Check SSH Credentials (SSHCheck)**
- **Check SSL validity (SSLCheck)**
    - Crawls the page and checks SSL on each one.

## How do I use it? (CLI)

To use the command-line interface, you simply run the command `node path/to/this/project/CLI/cli.js`. The CLI also offers you additional options you can use to debug the application and accelerate your workflow. The CLI uses yargs.js, so to view the additional options, append the `--help` flag. The CLI also offers help within the application, so when you run the application, start the `help` command to see the list of available commands.

### The --customscan flag

SEO-Checker also has a `--customscan` flag, where you can automate and run multiple scans using a simple json file. An example would be:

```json
[
    {
        "service": "WPCheck",
        "args": [
            "https://my-website.com/wp-admin",
            "admin",
            "admin123"
        ]
    },
    {
        "service": "deadLinkCheck",
        "args": [
            "https://example.com"
        ]
    },
    {
        "service": "SSLCheck",
        "args": [
            "https://maybe-it-works.com"
        ]
    },
    {
        "service": "FTPCheck",
        "args": [
            "192.168.1.100",
            "admin",
            "admin-pass"
        ]
    }
]
```

The scans will run one-by-one and will output information normally, as if you ran a command via CLI. You can redirect scan data using the `>` operator from BASH.
