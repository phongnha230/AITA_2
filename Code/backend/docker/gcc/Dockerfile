FROM gcc:14

WORKDIR /workspace

# Không chạy code sinh viên bằng root
RUN useradd -m -u 10001 sandbox

USER sandbox

CMD ["sh"]