// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

cur_frm.add_fetch('employee', 'company', 'company');
cur_frm.add_fetch('employee', 'employee_name', 'employee_name');

cur_frm.cscript.onload = function (doc, cdt, cdn) {
    if (!doc.status)
        set_multiple(cdt, cdn, {status: 'Draft'});
    if (doc.amended_from && doc.__islocal) {
        doc.status = "Draft";
    }
}

cur_frm.cscript.onload_post_render = function (doc, cdt, cdn) {
    if (doc.__islocal && doc.employee == frappe.defaults.get_user_default("Employee")) {
        cur_frm.set_value("employee", "");
        cur_frm.set_value("employee_name", "")
    }
}

cur_frm.cscript.refresh = function (doc, cdt, cdn) {

}

cur_frm.cscript.kra_template = function (doc, dt, dn) {
    erpnext.utils.map_current_doc({
        method: "erpnext.hr.doctype.appraisal.appraisal.fetch_appraisal_template",
        source_name: cur_frm.doc.kra_template,
        frm: cur_frm
    });
}

cur_frm.cscript.pull_timesheet_values = function (doc, cdt, cdn) {
    // get timesheet for employee from so so and so date to...
    if (doc.start_date && doc.end_date) {
        frappe.call({
            method: "tools_box._hr.doctype.employee_role.employee_role.get_timesheet_values",
            args: {employee: doc.employee, from_date: doc.start_date, to_date: doc.end_date},
            callback: function (r) {
                // get all the children and get there names
                // then set there values based on the values returned from the
                if (r.message) {
                	doc.goals.forEach(function(v1){
                		r.message.forEach(function(v2){
                			if(v1.assessment_area == v2.assessment_area){
                				frappe.model.set_value("Appraisal Goals", v1.name,"target_achieved", v2.target_achieved)
                				frappe.model.set_value("Appraisal Goals", v1.name,"self_score", v2.self_score) // must be 5
                				frappe.model.set_value("Appraisal Goals", v1.name,"score", v2.self_score) // must be 5
							}
						})
					})
                    refresh_field('goals');
                }
            }
        });
    }
}

cur_frm.cscript.calculate_total_score = function (doc, cdt, cdn) {
    //return get_server_fields('calculate_total','','',doc,cdt,cdn,1);
    var val = doc.goals || [];
    var total = 0;
    for (var i = 0; i < val.length; i++) {
        total = flt(total) + flt(val[i].score_earned)
    }
    doc.total_score = flt(total)
    refresh_field('total_score')
}


cur_frm.cscript.self_score = function (doc, cdt, cdn) {
    var d = locals[cdt][cdn];
    if (d.self_score) {
        if (flt(d.self_score) > 5) {
            frappe.msgprint(__("Self score must be less than or equal to 5"));
            d.self_score = 0;
            refresh_field('self_score', d.name, 'goals');
        }
    }
    cur_frm.cscript.calculate_total(doc, cdt, cdn);
}

cur_frm.cscript.score = function (doc, cdt, cdn) {
    var d = locals[cdt][cdn];
    if (d.score) {
        if (flt(d.score) > 5) {
            frappe.msgprint(__("Score must be less than or equal to 5"));
            d.score = 0;
            refresh_field('score', d.name, 'goals');
        }
        var total = flt(d.per_weightage * d.score) / 100;
        d.score_earned = total.toPrecision(2);
        refresh_field('score_earned', d.name, 'goals');
    }
    else {
        d.score_earned = 0;
        refresh_field('score_earned', d.name, 'goals');
    }
    cur_frm.cscript.calculate_total(doc, cdt, cdn);
}

cur_frm.cscript.calculate_total = function (doc, cdt, cdn) {
    var val = doc.goals || [];
    var total = 0;
    for (var i = 0; i < val.length; i++) {
        total = flt(total) + flt(val[i].score_earned);
    }
    doc.total_score = flt(total);
    refresh_field('total_score');
}

cur_frm.fields_dict.employee.get_query = function (doc, cdt, cdn) {
    return {query: "erpnext.controllers.queries.employee_query"}
}
