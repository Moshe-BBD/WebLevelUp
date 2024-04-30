output "RDS_INSTANCE_ENDPOINT" {
  value = aws_db_instance.spiderpedia_postgres_rds.endpoint
}