xdb = {}
require 'sqlescape'

local escape = sqlescape.EscapeFunction()

function xdb.connect(dsn, user, pass)
	xdb.dbh = freeswitch.Dbh(dsn)
	assert(xdb.dbh:connected())
end

function xdb.bind(dbh)
	xdb.dbh = dbh
end

local function get_insert_string(kvp)
	local comma = ""
	local keys = ""
	local values = ""

	for k, v in pairs(kvp) do
		keys =  keys .. comma .. k
		values = values .. comma .. "'" .. v .. "'"
		comma = ","
	end
	return keys, values
end

local function get_update_string(kvp)
	local comma = ""
	local str = ""
	for k, v in pairs(kvp) do
		str = str .. comma .. k .. "=" .. escape(v)
		comma = ","
	end
	return str
end

local function get_cond_string(kvp)
	str = ""

	if not kvp then return "" end

	local and_str = ""
	for key, value in pairs(kvp) do
		str = str .. and_str .. key .. "='" .. value .. "'"
		and_str = " and "
	end
	return str
end

function xdb.create(t, kvp)
	local keystring, valuesting = get_insert_string(kvp)
	sql = "INSERT INTO " .. t .. "(" .. keystring .. ") VALUES(" .. valuesting .. ")"
	xdb.dbh:query(sql)
	return xdb.dbh:affected_rows()
end

function xdb.create_return_id(t, kvp)
	local keys, values = get_insert_string(kvp)
	local ret_id = nil

	sql = "INSERT INTO " .. t .. "(" .. keys .. ") VALUES(" .. values .. ")"
	xdb.dbh:query(sql)

	if dbh:affected_rows() == 1 then
		dbh:query("SELECT LAST_INSERT_ROWID() as id", function(row)
			ret_id = row.id
		end)
	end

	return ret_id
end

function xdb.update(t, cond, kvp)
	local string = get_update_string(kvp)
	local condstr = get_cond_string(cond)
	sql = "UPDATE " .. t .. " SET " .. string .. " WHERE " .. condstr
	xdb.dbh:query(sql)
	return xdb.dbh:affected_rows()
end

function xdb.delete(t, what)
	local cond

	if (type(what) == 'number') then
		cond = "id = '" .. id .. "'"
	else
		cond = get_cond_string(what)
	end

	local sql = "DELETE FROM " .. table .. " WHERE " .. cond

	xdb.dbh:query(sql)
	return xdb.dbh:affected_rows()
end

function xdb.find(t, cond, func)
	local condstr = get_cond_string(cond)
	if not (condstr == "") then condstr = " WHERE " .. condstr end

	sql = "SELECT * FROM " .. t .. condstr
	xdb.dbh:query(sql, func)
end

function xdb.find_by_sql(sql, func)
	xdb.dbh:query(sql, func)
end

function xdb.update_model(t, m)
	local id = m.id
	m.id = nil
	return xdb.update(t, {id = id}, m)
end

function xdb.execute(sql)
	xdb.dbh:query(sql)
	return xtra.dbh:affected_rows()
end

function xdb.affected_rows()
	return xtra.dbh:affected_rows()
end

xdb.cond = get_cond_string;
