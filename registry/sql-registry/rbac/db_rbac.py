from lib2to3.refactor import get_all_fix_names
import os
from re import L
from typing import List
from rbac import RBAC, AuthProvider
from rbac.models import Access, RoleAccessMapping, UserRole, RoleType, SUPER_ADMIN_SCOPE
from registry import connect


class DbRBAC(RBAC):
    def __init__(self):
        self.conn = connect()

    def get_userroles(self) -> list[UserRole]:
        """query all the active user role records in SQL table
        """
        rows = self.conn.query(
            fr"""select record_id, project_name, user_name, role_name, create_reason, create_time, delete_reason, delete_time
            from userroles
            where delete_reason is null""")
        ret = []
        for row in rows:
            r = UserRole(**row)
            ret.append(UserRole(**row))
        return ret

    def get_userroles_by_user(self, user_name: str, role_name: str = None) -> list[UserRole]:
        """query the active user role of certain user
        """
        query = fr"""select record_id, project_name, user_name, role_name, create_reason, create_time, delete_reason, delete_time
            from userroles
            where delete_reason is null and user_name ='{user_name}'"""
        if role_name:
            query += fr"and role_name = '{role_name}'"
        rows = self.conn.query(query)
        ret = []
        for row in rows:
            ret.append(UserRole(**row))
        return ret

    def get_userroles_by_project(self, project_name: str, role_name: str = None) -> list[UserRole]:
        """query the active user role of certain project.
        """
        query = fr"""select record_id, project_name, user_name, role_name, create_reason, create_time, delete_reason, delete_time
            from userroles
            where delete_reason is null and project_name ='{project_name}'"""
        if role_name:
            query += fr"and role_name = '{role_name}'"
        rows = self.conn.query(query)
        ret = []
        for row in rows:
            ret.append(UserRole(**row))
        return ret

    def add_userrole(self, project_name: str, user_name: str, role_name: str, create_reason: str):
        """insert new user role relationship into sql table
        """
        # check if record already exist
        query = f"""select * from userroles where delete_reason is null 
            and project_name ='{project_name}' and user_name = '{user_name}' and role_name = '{role_name}'"""
        if len(self.conn.query(query)) > 0:
            return True

        # insert record
        query = f"""insert into userroles (project_name, user_name, role_name, create_reason, create_time)
            values ('{project_name}','{user_name}','{role_name}','{create_reason}', getutcdate())"""
        return self.conn.update(query)

    def delete_userrole(self, project_name: str, user_name: str, role_name: str, delete_reason: str):
        """mark existing user role relationship as deleted with reason
        """
        query = f'''UPDATE userroles SET
            [delete_reason] = '{delete_reason}',
            [delete_time] = getutcdate()
            WHERE [user_name] = '{user_name}' and [project_name] = '{project_name}' and [role_name] = '{role_name}'
            and [delete_time] is null'''
        return self.conn.update(query)

    def init_userrole(self, creator_name: str, project_name: str):
        """initialize user role relationship when a new project is created
        TODO: Add init user role to every new project call
        """
        create_reason = "creator of project, get admin by default."
        query = f"""insert into userroles (project_name, user_name, role_name, create_reason, create_time)
            values ('{project_name}','{creator_name}','{RoleType.ADMIN}','{create_reason}', getutcdate())"""
        return self.conn.update(query)

    def validate_access(self, userrole: UserRole, access: Access):
        if (userrole.project_name == SUPER_ADMIN_SCOPE or userrole.project_name == access.project_name) and access.access_name in RoleAccessMapping[userrole.role_name]:
            return True
        else:
            return False

    def get_aad_user_name(self, token: str):
        # TODO: extend this function when more login account types are suported
        jwks_uri = "https://login.microsoftonline.com/common/discovery/v2.0/keys"
        client_id = os.environ["AZURE_CLIENT_ID"]
        auth = AuthProvider(jwks_uri, client_id)
        decoded = auth.decode_token(token)
        return decoded.get("preferred_username")

    def is_project_admin(self, token: str, project_name: str):
        """To protect management APIs, only admin can modify RBAC records
        """
        user_name = self.get_aad_user_name(token)
        userroles = self.get_userroles_by_user(user_name, RoleType.ADMIN)
        for userrole in userroles:
            if userrole.project_name == project_name or userrole.project_name == SUPER_ADMIN_SCOPE:
                return True
        return False

    def is_global_admin(self, token: str):
        return self.is_project_admin(token, SUPER_ADMIN_SCOPE)
