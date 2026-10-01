FROM eclipse-temurin:17-jdk

WORKDIR /workspace

# Tạo user không có quyền root để chạy code sinh viên
RUN useradd -m -u 10001 sandbox

USER sandbox

CMD ["sh"]