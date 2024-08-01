![alt tag](https://github.com/over55/workery-django/blob/master/workery/static/img/compressed-logo.png)

# Statistics Canada Utility Module

The purpose of this module is to provide access to a few datapoints provided by [Statistics Canada](www.statcan.gc.ca) for any Golang application; more specifically, the features are as follows:

* Golang struct of "National Occupational Classification (NOC)"
* Golang struct of "North American Industry Classification System (NAICS)"
* Import NOC from CSV
* Import NAICS from CSV

## Installation

Step 1:

```
go get github.com/over55/monorepo/cloud/statcan
```

Step 2:
Download the **NOC** csv formatted data via [this link](https://www150.statcan.gc.ca/n1/en/catalogue/12-583-X) and save into your `data` folder. (Note: Recommended *National Occupational Classification (NOC), 2021 Version 1.0*)

Step 3:
Download the **NAICS** csv formatted data via [this link](https://www.statcan.gc.ca/en/concepts/industry) and save into your `data` folder. (Note: Recommended *NAICS Canada 2022 Version 1.0*)

## Contributing

Found a bug? Want a feature to improve the package? Please create an [issue](https://github.com/over55/workery/monorepo).

## License
This application is licensed under the **GNU Affero General Public License v3.0**. See [LICENSE](LICENSE) for more information.
