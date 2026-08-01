#!/usr/bin/env python3
"""Generate a small text-based PDF fixture for HuntBoard tests."""
import pymupdf

doc = pymupdf.open()
page = doc.new_page()
page.insert_text(
    (72, 72),
    "Nedri Febrianto\nData Engineer Intern\n"
    "Python SQL GCP Airflow\n"
    "Built ETL pipelines handling 10GB daily\n"
    "AWS Certified Cloud Practitioner",
    fontsize=12,
)
doc.save("tests/fixtures/sample-resume.pdf")
print("wrote tests/fixtures/sample-resume.pdf")
