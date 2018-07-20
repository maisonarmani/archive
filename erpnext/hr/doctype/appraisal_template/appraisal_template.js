// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
var take = function (obj, param) {
    var __self__ = this;
    if (typeof param !== 'string') {
        param.forEach(function (val) {
            __self__[val] = obj[val] || "";
        });
    } else {
        __self__[param] = obj[param] || "";
    }
};


function add_fetch_child(sdoctype, sdocname, sfield, cdt, cdn, dfield) {
    frappe.call({
        method: "frappe.client.get_value",
        args: {
            doctype: sdoctype,
            fieldname: sfield,
            filters: {name: sdocname},
        },
        callback: function (r) {
            if (r.message) {
                frappe.model.set_value(cdt, cdn, dfield, r.message[sfield]);
            }
        }
    });
}


frappe.ui.form.on('Appraisal Template', {
    refresh: function (frm) {

    },
    get_employee_roles: function (frm, cdt, cdn) {
        if (frm.doc.department) {
            frappe.call({
                method: "tools_box._hr.doctype.employee_role.employee_role.get_todo",
                args: {department: frm.doc.department, designation: frm.doc.designation},
                callback: function (r) {
                    if (r.message) {
                        var message = r.message;
                        cur_frm.doc.goals = [];
                        message.forEach(function (val) {
                            var d = frappe.model.add_child(cur_frm.doc, "Appraisal Template Goals", "goals");
                            take.apply(d, [val, ['assessment_area', "has_target", "target_frequency", 'target']]);
                        });
                        refresh_field('goals');
                    }
                }
            });
        }
    },
});


frappe.ui.form.on('Appraisal Template Goals', {

    assessment_area: function (frm, cdt, cdn) {
        var assessment_area = frappe.model.get_value(cdt, cdn, "assessment_area")
        add_fetch_child("Assessment Area", assessment_area, "has_numerical_target", cdt, cdn, "has_target");
        add_fetch_child("Assessment Area", assessment_area, "numerical_target", cdt, cdn, "target");
        add_fetch_child("Assessment Area", assessment_area, "target_frequency", cdt, cdn, "target_frequency");
    },
    has_target: function (frm, cdt, cdn) {
        if (frappe.model.get_value(cdt, cdn, "has_target") == 0) {
            frappe.model.set_value(cdt, cdn, "target", 0)
        }
    }
});
