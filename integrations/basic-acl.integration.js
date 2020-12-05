const axios = require('axios').default;

const environment = require('../environment');

const { HttpException } = require('../common/http-exception');

class BasicACL {
  constructor () {
    this.baseUrl = environment.BASIC_ACL_BASE_URL;
    this.companyUuid = environment.BASIC_ACL_COMPANY_UUID;
    this.email = environment.BASIC_ACL_ADMIN_EMAIL;
    this.password = environment.BASIC_ACL_ADMIN_PASSWORD;
    this.projectCode = environment.BASIC_ACL_PROJECT_CODE;
  }

  async getToken () {
    const response = await axios({
      url: `${this.baseUrl}users/login-admin`,
      method: 'post',
      data: {
        companyUuid: this.companyUuid,
        email: this.email,
        password: this.password
      }
    });

    const { data } = response;

    const { accessToken } = data;

    return accessToken;
  }

  async register (email, password, phone, roleCode) {
    try {
      const token = await this.getToken();

      const response = await axios({
        url: `${this.baseUrl}users`,
        method: 'post',
        headers: {
          'company-uuid': this.companyUuid,
          Authorization: `Bearer ${token}`
        },
        data: {
          companyUuid: this.companyUuid,
          email,
          password,
          phone,
          roleCode
        }
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(error.response.data.statusCode, error.response.data.message);
    }
  }

  async sendForgottenPasswordEmail (email) {
    try {
      const response = await axios({
        url: `${this.baseUrl}users/forgotten-password`,
        method: 'post',
        data: {
          companyUuid: this.companyUuid,
          email
        }
      });

      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data.statusCode, error.response.data.message);
    }
  }

  async changePassword (email, oldPassword, newPassword) {
    try {
      const token = await this.getToken();

      const response = await axios({
        url: `${this.baseUrl}users/change-password`,
        method: 'post',
        headers: {
          Authorization: `Bearer ${token}`,
          'company-uuid': this.companyUuid
        },
        data: {
          companyUuid: this.companyUuid,
          email,
          oldPassword,
          newPassword
        }
      });

      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data.statusCode, error.response.data.message);
    }
  }

  async checkPermission (token, requestedRoute, requestedMethod) {
    try {
      const response = await axios({
        url: `${this.baseUrl}permissions/check`,
        method: 'post',
        data: {
          companyUuid: this.companyUuid,
          projectCode: this.projectCode,
          token,
          requestedRoute,
          requestedMethod
        }
      });

      const { data } = response;

      const { allowed, reason } = data;

      return { allowed, reason };
    } catch (error) {
      throw new HttpException(error.response.data.statusCode, error.response.data.message);
    }
  }

  async changePhone (email, phone) {
    try {
      const token = await this.getToken();

      const response = await axios({
        url: `${this.baseUrl}users/change-phone`,
        method: 'patch',
        headers: {
          Authorization: `Bearer ${token}`,
          'company-uuid': this.companyUuid
        },
        data: {
          companyUuid: this.companyUuid,
          email,
          phone
        }
      });

      return response.data;
    } catch (error) {
      throw new HttpException(error.response.data.statusCode, error.response.data.message);
    }
  }
}

module.exports = {
  basicACL: new BasicACL()
};
