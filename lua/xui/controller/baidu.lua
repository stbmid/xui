--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2016, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */
]]

content_type("application/json")
require 'xdb'
xdb.bind(xtra.dbh)

put("/acckey", function(params)
	n, dicts = xdb.find_by_cond("dicts", {realm = 'BAIDU'});
	local obj = {}

	if (n > 0) then
		for key, val in pairs(dicts) do
			obj[val.k] = val.v
		end
	end

utils.print_r(obj)

	local url = "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&" ..
		"&client_id=" .. obj.APPKEY ..
		"&client_secret=" .. obj.SECKEY

	print(url)

	return obj
end)
