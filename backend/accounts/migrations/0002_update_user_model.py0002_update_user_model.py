from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
        migrations.AddField(
            model_name='user',
            name='address',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('Admin',           'Administrator'),
                    ('PropertyManager', 'Property Manager'),
                    ('Tenant',          'Tenant'),
                    ('Vendor',          'Vendor'),
                    ('Accountant',      'Accountant'),
                ],
                default='Tenant',
                max_length=20,
            ),
        ),
    ]
