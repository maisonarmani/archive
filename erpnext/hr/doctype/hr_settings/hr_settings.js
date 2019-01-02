// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('HR Settings', {
	refresh: function(frm) {

	},
	reset_salary_structure:function(){
		frappe.confirm("Are you sure you want to clear the salary structure? ",function(){
			frappe.call({
				method:"erpnext.hr.doctype.hr_settings.hr_settings.reset_salary_structure",
				callback:function(ret){
					if (ret.message){
						frappe.show_alert("Old amount values have been set to zero.")
					}
				}
			})
		})
	}
});
