# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

from frappe.model.document import Document

class HRSettings(Document):
	def validate(self):
		from erpnext.setup.doctype.naming_series.naming_series import set_by_naming_series
		set_by_naming_series("Employee", "employee_number",
			self.get("emp_created_by")=="Naming Series", hide_name_field=True)



@frappe.whitelist(True)
def reset_salary_structure():
	frappe.db.sql("UPDATE `tabSalary Detail` SET amount = 0")
	return True