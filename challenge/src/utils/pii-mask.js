// Simple utility to mask PII in logs

function maskEmail(email){
    if (!email || !email.includes('@')) return '***';

    const [user, domain] = email.split('@');
    const maskedUser = user[0] + '***' + (user.length > 1 ? user[user.length - 1] : '');
    const domainParts = domain.split('.');

    const maskedDomain = domainParts[0][0] + '***.' + domainParts[domainParts.length - 1];

    return `${maskedUser}@${maskedDomain}`;
}


function maskPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***';
    return `***-***-${digits.slice(-4)}`; 
}

function maskName(name) {
    if (!name) return '***';
    const words = name.trim().split(/\s+/);
    return words.map(w => w[0] + '***').join(' ');
}

function maskAddress(address) {
    if (!address) return '***';
    return address.split(',')[0].slice(0, 3) + '*** [REDACTED]';
}


function maskPII(value, type) {
    if (!value) return '***';

    switch (type) {
        case 'email':
            return maskEmail(value);
        case 'phone':
            return maskPhone(value);
        case 'name':
            return maskName(value);
        case 'address':
            return maskAddress(value);
        default:
            // Generic masking
            return value.slice(0, 3) + '***';
    }
}

module.exports = {
    maskPII,
    maskEmail,
    maskName,
    maskPhone,
    maskAddress
};