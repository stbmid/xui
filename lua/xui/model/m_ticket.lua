--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2017, Seven Du <dujinfang@x-y-t.cn>
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

require 'xdb'
require 'm_dict'
require 'xwechat'


m_ticket = {}

m_ticket.send_wechat_notification = function(realm, user_id, redirect_uri, subject, content)

	local weuser = xdb.find_one("wechat_users", {user_id = user_id})

	if weuser then
		local wechat = m_dict.get_obj('WECHAT/' .. realm)
		-- token = xwechat.access_token('realm')
		token = xwechat.get_token(realm, wechat.APPID, wechat.APPSEC)
		redirect_uri = xwechat.redirect_uri(wechat.APPID, redirect_uri, "200")

		return xwechat.send_ticket_notification(realm, weuser.openid, redirect_uri, subject, content)
	end
end


return m_ticket