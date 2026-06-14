class SecurityToken {
  constructor(jwtString, clearance, integrity) {
    this.jwtString = jwtString;
    this.clearance = clearance;
    this.integrity = integrity;
    Object.freeze(this);
  }
}

module.exports = SecurityToken;
